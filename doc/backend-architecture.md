# バックエンドアーキテクチャ設計書

## 概要
本ドキュメントでは、物理機構共有プラットフォームのバックエンドアーキテクチャ設計について記載します。

## 1. アーキテクチャ概要

### 1.1 技術スタック
- 言語: Python 3.11+
- Webフレームワーク: FastAPI
- データベース: PostgreSQL
- キャッシュ: Redis
- ファイルストレージ: Azure Blob Storage
- 検索エンジン: Elasticsearch
- タスクキュー: Celery

### 1.2 アーキテクチャパターン
- クリーンアーキテクチャを採用
- 依存性逆転の原則に基づく設計
- ドメイン駆動設計（DDD）の概念を取り入れる

## 2. プロジェクト構造

```
backend/
├── app/
│   ├── api/                    # APIエンドポイント
│   │   ├── v1/
│   │   │   ├── mechanisms.py
│   │   │   ├── users.py
│   │   │   └── auth.py
│   │   └── dependencies.py
│   ├── core/                   # コア設定
│   │   ├── config.py
│   │   ├── security.py
│   │   └── exceptions.py
│   ├── domain/                 # ドメインモデル
│   │   ├── mechanism.py
│   │   ├── user.py
│   │   └── value_objects.py
│   ├── infrastructure/         # インフラ層
│   │   ├── database.py
│   │   ├── repositories/
│   │   └── services/
│   ├── services/              # ユースケース
│   │   ├── mechanism.py
│   │   └── user.py
│   └── main.py
├── tests/                     # テスト
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── alembic/                   # マイグレーション
```

## 3. レイヤー構造

### 3.1 ドメイン層
```python
# domain/mechanism.py
from dataclasses import dataclass
from datetime import datetime
from typing import List, Optional

@dataclass
class Mechanism:
    id: str
    title: str
    description: str
    user_id: str
    file_url: str
    thumbnail_url: str
    duration: int
    created_at: datetime
    updated_at: datetime
    is_published: bool
    categories: List[str]

    def can_be_edited_by(self, user_id: str) -> bool:
        return self.user_id == user_id

    def publish(self) -> None:
        self.is_published = True
        self.updated_at = datetime.utcnow()
```

### 3.2 リポジトリ層
```python
# infrastructure/repositories/mechanism.py
from abc import ABC, abstractmethod
from typing import List, Optional
from domain.mechanism import Mechanism

class MechanismRepository(ABC):
    @abstractmethod
    async def find_by_id(self, id: str) -> Optional[Mechanism]:
        pass

    @abstractmethod
    async def save(self, mechanism: Mechanism) -> Mechanism:
        pass

    @abstractmethod
    async def find_all(
        self,
        page: int,
        limit: int,
        category_ids: Optional[List[str]] = None,
        user_id: Optional[str] = None
    ) -> List[Mechanism]:
        pass

class PostgresMechanismRepository(MechanismRepository):
    def __init__(self, db_session):
        self.db_session = db_session

    async def find_by_id(self, id: str) -> Optional[Mechanism]:
        # PostgreSQLからの取得実装
        pass

    async def save(self, mechanism: Mechanism) -> Mechanism:
        # PostgreSQLへの保存実装
        pass
```

### 3.3 サービス層
```python
# services/mechanism.py
from typing import List, Optional
from domain.mechanism import Mechanism
from infrastructure.repositories.mechanism import MechanismRepository

class MechanismService:
    def __init__(self, repository: MechanismRepository):
        self.repository = repository

    async def create_mechanism(
        self,
        title: str,
        description: str,
        user_id: str,
        file_url: str,
        thumbnail_url: str,
        duration: int,
        categories: List[str]
    ) -> Mechanism:
        mechanism = Mechanism(
            title=title,
            description=description,
            user_id=user_id,
            file_url=file_url,
            thumbnail_url=thumbnail_url,
            duration=duration,
            categories=categories
        )
        return await self.repository.save(mechanism)

    async def update_mechanism(
        self,
        mechanism_id: str,
        user_id: str,
        **updates
    ) -> Optional[Mechanism]:
        mechanism = await self.repository.find_by_id(mechanism_id)
        if not mechanism or not mechanism.can_be_edited_by(user_id):
            return None

        for key, value in updates.items():
            setattr(mechanism, key, value)
        
        return await self.repository.save(mechanism)
```

### 3.4 API層
```python
# api/v1/mechanisms.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from services.mechanism import MechanismService
from api.dependencies import get_current_user

router = APIRouter()

@router.post("/mechanisms")
async def create_mechanism(
    data: MechanismCreate,
    current_user = Depends(get_current_user),
    mechanism_service: MechanismService = Depends()
):
    try:
        mechanism = await mechanism_service.create_mechanism(
            title=data.title,
            description=data.description,
            user_id=current_user.id,
            file_url=data.file_url,
            thumbnail_url=data.thumbnail_url,
            duration=data.duration,
            categories=data.categories
        )
        return mechanism
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

## 4. 非同期処理

### 4.1 Celeryタスク
```python
# infrastructure/tasks.py
from celery import Celery
from infrastructure.services.storage import StorageService

celery = Celery('tasks', broker='redis://localhost:6379/0')

@celery.task
def process_mechanism_file(mechanism_id: str, file_path: str):
    try:
        # ファイル処理
        # サムネイル生成
        # 動画時間の取得
        # ストレージへのアップロード
        pass
    except Exception as e:
        # エラーハンドリング
        pass
```

### 4.2 キャッシュ戦略
```python
# infrastructure/cache.py
from typing import Optional
from redis import Redis
from domain.mechanism import Mechanism

class CacheService:
    def __init__(self, redis: Redis):
        self.redis = redis

    async def get_mechanism(self, mechanism_id: str) -> Optional[Mechanism]:
        cached = await self.redis.get(f"mechanism:{mechanism_id}")
        if cached:
            return Mechanism.from_json(cached)
        return None

    async def set_mechanism(self, mechanism: Mechanism, expire: int = 3600):
        await self.redis.set(
            f"mechanism:{mechanism.id}",
            mechanism.to_json(),
            ex=expire
        )
```

## 5. セキュリティ実装

### 5.1 認証ミドルウェア
```python
# core/security.py
from fastapi import Security, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt
from datetime import datetime, timedelta

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPBearer = Security(security)
):
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401)
        return await user_service.get_user(user_id)
    except jwt.JWTError:
        raise HTTPException(status_code=401)
```

### 5.2 認可デコレータ
```python
# core/permissions.py
from functools import wraps
from fastapi import HTTPException

def require_permissions(*permissions):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            user = kwargs.get('current_user')
            if not user:
                raise HTTPException(status_code=401)
            
            if not all(user.has_permission(p) for p in permissions):
                raise HTTPException(status_code=403)
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator
```

## 6. エラーハンドリング

### 6.1 カスタム例外
```python
# core/exceptions.py
class DomainException(Exception):
    def __init__(self, message: str, code: str):
        self.message = message
        self.code = code

class MechanismNotFound(DomainException):
    def __init__(self):
        super().__init__(
            message="Mechanism not found",
            code="MECHANISM_NOT_FOUND"
        )

class UnauthorizedOperation(DomainException):
    def __init__(self):
        super().__init__(
            message="Unauthorized operation",
            code="UNAUTHORIZED_OPERATION"
        )
```

### 6.2 グローバルエラーハンドラー
```python
# core/error_handlers.py
from fastapi import Request
from fastapi.responses import JSONResponse
from core.exceptions import DomainException

async def domain_exception_handler(
    request: Request,
    exc: DomainException
):
    return JSONResponse(
        status_code=400,
        content={
            "status": "error",
            "message": exc.message,
            "code": exc.code
        }
    )
```

## 7. モニタリングと監視

### 7.1 ロギング設定
```python
# core/logging.py
import logging
from logging.config import dictConfig

logging_config = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "default",
            "level": "INFO"
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "formatter": "default",
            "filename": "app.log",
            "maxBytes": 10485760,
            "backupCount": 5,
            "level": "ERROR"
        }
    },
    "root": {
        "level": "INFO",
        "handlers": ["console", "file"]
    }
}

dictConfig(logging_config)
logger = logging.getLogger(__name__)
```

### 7.2 メトリクス収集
```python
# core/metrics.py
from prometheus_client import Counter, Histogram
from functools import wraps
import time

request_count = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

request_latency = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

def track_metrics(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            response = await func(*args, **kwargs)
            request_count.labels(
                method=kwargs.get('method'),
                endpoint=kwargs.get('endpoint'),
                status=response.status_code
            ).inc()
            return response
        finally:
            request_latency.labels(
                method=kwargs.get('method'),
                endpoint=kwargs.get('endpoint')
            ).observe(time.time() - start_time)
    return wrapper
```

## 8. テスト戦略

### 8.1 単体テスト
```python
# tests/unit/test_mechanism.py
import pytest
from domain.mechanism import Mechanism
from datetime import datetime

def test_mechanism_can_be_edited_by_owner():
    mechanism = Mechanism(
        id="1",
        title="Test",
        user_id="user1",
        created_at=datetime.utcnow()
    )
    assert mechanism.can_be_edited_by("user1") is True
    assert mechanism.can_be_edited_by("user2") is False
```

### 8.2 統合テスト
```python
# tests/integration/test_mechanism_service.py
import pytest
from services.mechanism import MechanismService
from infrastructure.repositories.mechanism import PostgresMechanismRepository

@pytest.mark.asyncio
async def test_create_mechanism(db_session):
    repository = PostgresMechanismRepository(db_session)
    service = MechanismService(repository)
    
    mechanism = await service.create_mechanism(
        title="Test Mechanism",
        description="Test Description",
        user_id="user1",
        file_url="test.mp4",
        thumbnail_url="thumb.jpg",
        duration=30,
        categories=["physics"]
    )
    
    assert mechanism.title == "Test Mechanism"
    assert mechanism.user_id == "user1"
