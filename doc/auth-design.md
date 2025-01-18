# 認証・認可設計書

## 概要
本ドキュメントでは、物理機構共有プラットフォームの認証・認可システムの実装詳細について記載します。

## 1. 認証システム

### 1.1 JWT (JSON Web Token) 設計

#### トークン構成
```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "ユーザーID (UUID)",
    "email": "ユーザーメールアドレス",
    "username": "ユーザー名",
    "roles": ["user", "admin"],
    "iat": "発行時刻 (Unix timestamp)",
    "exp": "有効期限 (Unix timestamp)",
    "jti": "トークン一意ID"
  }
}
```

#### トークン設定
- アクセストークン有効期限: 1時間
- リフレッシュトークン有効期限: 30日
- 署名アルゴリズム: RS256 (非対称暗号)

### 1.2 パスワード管理
- ハッシュアルゴリズム: Argon2id
- ソルト: ユーザーごとにランダム生成
- パスワード要件:
  - 最小長: 8文字
  - 最大長: 100文字
  - 必須要素: 大文字、小文字、数字、特殊文字

### 1.3 LDAP認証連携
```python
class LDAPAuthenticator:
    def __init__(self):
        self.ldap_server = "ldap://example.com"
        self.base_dn = "dc=example,dc=com"
        
    async def authenticate(self, username: str, password: str) -> bool:
        # LDAP認証ロジック
        pass
        
    async def sync_user_info(self, username: str) -> dict:
        # ユーザー情報同期ロジック
        pass
```

## 2. 認可システム

### 2.1 ロール定義

#### システムロール
1. 未認証ユーザー
   - 公開メカニズムの閲覧
   - カテゴリー一覧の閲覧

2. 一般ユーザー (user)
   - メカニズムの投稿・編集・削除（自身の投稿のみ）
   - いいね、コメント、ダウンロード
   - プロフィール編集

3. 管理者 (admin)
   - すべてのメカニズムの管理
   - ユーザー管理
   - カテゴリー管理
   - システム設定

### 2.2 パーミッション管理

#### リソースごとの権限マトリックス
```typescript
const permissionMatrix = {
  mechanisms: {
    create: ["user", "admin"],
    read: ["*"],
    update: ["owner", "admin"],
    delete: ["owner", "admin"]
  },
  comments: {
    create: ["user", "admin"],
    read: ["*"],
    update: ["owner", "admin"],
    delete: ["owner", "admin"]
  },
  users: {
    create: ["admin"],
    read: ["*"],
    update: ["owner", "admin"],
    delete: ["admin"]
  },
  categories: {
    create: ["admin"],
    read: ["*"],
    update: ["admin"],
    delete: ["admin"]
  }
};
```

### 2.3 認可チェック実装

#### デコレーターベースの権限チェック
```python
from functools import wraps
from typing import List

def require_permissions(resource: str, action: str):
    def decorator(f):
        @wraps(f)
        async def decorated_function(*args, **kwargs):
            user = get_current_user()
            if not has_permission(user, resource, action):
                raise PermissionDenied()
            return await f(*args, **kwargs)
        return decorated_function
    return decorator

# 使用例
@require_permissions("mechanisms", "create")
async def create_mechanism(mechanism_data: dict):
    # メカニズム作成ロジック
    pass
```

#### リソースオーナーシップチェック
```python
async def check_ownership(user_id: str, resource_id: str, resource_type: str) -> bool:
    resource = await get_resource(resource_type, resource_id)
    return resource.user_id == user_id
```

## 3. セキュリティ対策

### 3.1 レート制限
```python
from fastapi import FastAPI
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/auth/login")
@limiter.limit("5/minute")
async def login(request: Request):
    # ログインロジック
    pass
```

### 3.2 セッション管理
- セッションID: UUIDv4
- セッション保存: Redis
- セッション有効期限: 24時間
- セッション更新: アクティブな操作時

### 3.3 CSRF対策
```python
from fastapi import FastAPI, Request, Response
from fastapi.middleware.csrf import CSRFMiddleware

app = FastAPI()
app.add_middleware(
    CSRFMiddleware,
    secret_key="your-secret-key",
    safe_methods={"GET", "HEAD", "OPTIONS"}
)
```

## 4. 監査ログ

### 4.1 ログ記録項目
```json
{
  "timestamp": "ISO8601形式の時刻",
  "user_id": "操作ユーザーID",
  "action": "実行アクション",
  "resource_type": "リソース種別",
  "resource_id": "リソースID",
  "ip_address": "クライアントIP",
  "user_agent": "ユーザーエージェント",
  "status": "成功/失敗",
  "details": "詳細情報"
}
```

### 4.2 ログ保存
- 保存先: Elasticsearch
- 保存期間: 1年間
- インデックス: 月次ローテーション

## 5. エラーハンドリング

### 5.1 認証エラー
```python
class AuthenticationError(Exception):
    def __init__(self, message: str, error_code: str):
        self.message = message
        self.error_code = error_code

# エラーハンドラー
@app.exception_handler(AuthenticationError)
async def auth_error_handler(request: Request, exc: AuthenticationError):
    return JSONResponse(
        status_code=401,
        content={
            "status": "error",
            "message": exc.message,
            "error_code": exc.error_code
        }
    )
```

### 5.2 認可エラー
```python
class AuthorizationError(Exception):
    def __init__(self, message: str, error_code: str):
        self.message = message
        self.error_code = error_code

# エラーハンドラー
@app.exception_handler(AuthorizationError)
async def auth_error_handler(request: Request, exc: AuthorizationError):
    return JSONResponse(
        status_code=403,
        content={
            "status": "error",
            "message": exc.message,
            "error_code": exc.error_code
        }
    )
