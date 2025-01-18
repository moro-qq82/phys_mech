# API エンドポイント設計書

## 概要
本ドキュメントでは、物理機構共有プラットフォームのAPIエンドポイント設計について記載します。

## 共通仕様

### ベースURL
```
https://api.physmech.com/v1
```

### 認証
- Bearer トークン認証
- Authorization ヘッダーにJWTトークンを設定
```
Authorization: Bearer <token>
```

### レスポンス形式
```json
{
  "status": "success" | "error",
  "data": {}, // レスポンスデータ
  "message": "エラーメッセージ等",
  "pagination": { // ページネーション時のみ
    "current_page": 1,
    "total_pages": 10,
    "total_items": 100,
    "per_page": 10
  }
}
```

### エラーレスポンス
```json
{
  "status": "error",
  "message": "エラーの詳細メッセージ",
  "error_code": "ERROR_CODE"
}
```

## エンドポイント一覧

### 認証関連 (/auth)

#### POST /auth/register
ユーザー登録
```json
Request:
{
  "email": "string",
  "password": "string",
  "username": "string",
  "display_name": "string"
}

Response:
{
  "status": "success",
  "data": {
    "user_id": "uuid",
    "email": "string",
    "username": "string",
    "display_name": "string",
    "token": "string"
  }
}
```

#### POST /auth/login
ログイン
```json
Request:
{
  "email": "string",
  "password": "string"
}

Response:
{
  "status": "success",
  "data": {
    "token": "string",
    "user": {
      "id": "uuid",
      "email": "string",
      "username": "string",
      "display_name": "string"
    }
  }
}
```

### ユーザー関連 (/users)

#### GET /users/{user_id}
ユーザー情報取得
```json
Response:
{
  "status": "success",
  "data": {
    "id": "uuid",
    "username": "string",
    "display_name": "string",
    "profile_image_url": "string",
    "bio": "string",
    "created_at": "timestamp",
    "interests": ["string"],
    "categories": [{
      "id": "uuid",
      "name": "string"
    }]
  }
}
```

#### PUT /users/{user_id}
ユーザー情報更新
```json
Request:
{
  "display_name": "string",
  "bio": "string",
  "profile_image_url": "string"
}

Response:
{
  "status": "success",
  "data": {
    "id": "uuid",
    "display_name": "string",
    "bio": "string",
    "profile_image_url": "string"
  }
}
```

### メカニズム関連 (/mechanisms)

#### POST /mechanisms
メカニズム投稿
```json
Request:
{
  "title": "string",
  "description": "string",
  "file_url": "string",
  "thumbnail_url": "string",
  "duration": "integer",
  "categories": ["uuid"],
  "is_published": "boolean"
}

Response:
{
  "status": "success",
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "file_url": "string",
    "thumbnail_url": "string",
    "duration": "integer",
    "created_at": "timestamp",
    "categories": [{
      "id": "uuid",
      "name": "string"
    }]
  }
}
```

#### GET /mechanisms
メカニズム一覧取得
```json
Query Parameters:
- page: integer
- per_page: integer
- sort: "latest" | "popular"
- category: "uuid"
- search: "string"

Response:
{
  "status": "success",
  "data": [{
    "id": "uuid",
    "title": "string",
    "description": "string",
    "thumbnail_url": "string",
    "duration": "integer",
    "user": {
      "id": "uuid",
      "display_name": "string"
    },
    "stats": {
      "views": "integer",
      "likes": "integer",
      "comments": "integer"
    },
    "created_at": "timestamp"
  }],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_items": 100,
    "per_page": 10
  }
}
```

#### GET /mechanisms/{mechanism_id}
メカニズム詳細取得
```json
Response:
{
  "status": "success",
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "file_url": "string",
    "thumbnail_url": "string",
    "duration": "integer",
    "user": {
      "id": "uuid",
      "display_name": "string",
      "profile_image_url": "string"
    },
    "categories": [{
      "id": "uuid",
      "name": "string"
    }],
    "stats": {
      "views": "integer",
      "likes": "integer",
      "comments": "integer",
      "downloads": "integer"
    },
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

### インタラクション関連

#### POST /mechanisms/{mechanism_id}/likes
いいね追加
```json
Response:
{
  "status": "success",
  "data": {
    "mechanism_id": "uuid",
    "likes_count": "integer"
  }
}
```

#### DELETE /mechanisms/{mechanism_id}/likes
いいね削除
```json
Response:
{
  "status": "success",
  "data": {
    "mechanism_id": "uuid",
    "likes_count": "integer"
  }
}
```

#### POST /mechanisms/{mechanism_id}/comments
コメント投稿
```json
Request:
{
  "content": "string"
}

Response:
{
  "status": "success",
  "data": {
    "id": "uuid",
    "content": "string",
    "user": {
      "id": "uuid",
      "display_name": "string",
      "profile_image_url": "string"
    },
    "created_at": "timestamp"
  }
}
```

#### GET /mechanisms/{mechanism_id}/comments
コメント一覧取得
```json
Query Parameters:
- page: integer
- per_page: integer

Response:
{
  "status": "success",
  "data": [{
    "id": "uuid",
    "content": "string",
    "user": {
      "id": "uuid",
      "display_name": "string",
      "profile_image_url": "string"
    },
    "created_at": "timestamp"
  }],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_items": 100,
    "per_page": 10
  }
}
```

#### POST /mechanisms/{mechanism_id}/downloads
ダウンロード記録
```json
Response:
{
  "status": "success",
  "data": {
    "download_url": "string",
    "expires_at": "timestamp"
  }
}
```

### カテゴリー関連 (/categories)

#### GET /categories
カテゴリー一覧取得
```json
Response:
{
  "status": "success",
  "data": [{
    "id": "uuid",
    "name": "string",
    "description": "string",
    "mechanism_count": "integer"
  }]
}
```

### 統計情報関連 (/stats)

#### GET /stats/mechanisms/{mechanism_id}
メカニズムの統計情報取得
```json
Query Parameters:
- period: "day" | "week" | "month" | "year"
- start_date: "date"
- end_date: "date"

Response:
{
  "status": "success",
  "data": {
    "views": [{
      "date": "string",
      "count": "integer"
    }],
    "likes": [{
      "date": "string",
      "count": "integer"
    }],
    "downloads": [{
      "date": "string",
      "count": "integer"
    }]
  }
}
```

## セキュリティ要件

### レート制限
- 認証済みユーザー: 1000 リクエスト/時
- 未認証ユーザー: 100 リクエスト/時

### CORS設定
- 許可オリジン: 設定された本番・開発環境のドメインのみ
- 許可メソッド: GET, POST, PUT, DELETE, OPTIONS
- 許可ヘッダー: Content-Type, Authorization

### 入力バリデーション
- すべてのリクエストボディはJSONスキーマによる検証
- XSS対策のための文字列サニタイズ
- ファイルアップロードの種類・サイズ制限

## キャッシュ戦略

### キャッシュ対象
- GET /mechanisms (5分)
- GET /categories (1時間)
- GET /users/{user_id} (5分)
- GET /stats/* (15分)

### キャッシュ無効化
- POST, PUT, DELETE リクエスト後に関連キャッシュを自動無効化
