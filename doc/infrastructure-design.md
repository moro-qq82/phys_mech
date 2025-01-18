# インフラストラクチャ設計書

## 概要
本ドキュメントでは、物理機構共有プラットフォームのインフラストラクチャ設計について記載します。

## 1. システム構成

### 1.1 全体アーキテクチャ
```
[Client Browsers] → [Azure Front Door/CDN]
         ↓
[Azure App Service (Frontend)] → [Azure CDN]
         ↓
[Azure App Service (Backend API)]
         ↓
[Azure Database for PostgreSQL] [Azure Cache for Redis] [Azure Blob Storage]
```

### 1.2 コンポーネント構成
- フロントエンド: Azure App Service (Premium v3)
- バックエンドAPI: Azure App Service (Premium v3)
- データベース: Azure Database for PostgreSQL Flexible Server
- キャッシュ: Azure Cache for Redis
- ストレージ: Azure Blob Storage
- CDN: Azure CDN
- 監視: Azure Monitor + Application Insights

## 2. リソース要件

### 2.1 App Service (Frontend)
```yaml
名称: phys-mech-frontend
SKU: Premium v3 P1v3
インスタンス数: 2-5 (自動スケール)
仕様:
  - vCPU: 2
  - メモリ: 8GB
  - ストレージ: 250GB
自動スケール設定:
  - CPU使用率: 70%超過で増加
  - メモリ使用率: 80%超過で増加
  - インスタンス数: 最小2、最大5
```

### 2.2 App Service (Backend)
```yaml
名称: phys-mech-backend
SKU: Premium v3 P2v3
インスタンス数: 2-5 (自動スケール)
仕様:
  - vCPU: 4
  - メモリ: 16GB
  - ストレージ: 250GB
自動スケール設定:
  - CPU使用率: 70%超過で増加
  - メモリ使用率: 80%超過で増加
  - インスタンス数: 最小2、最大5
```

### 2.3 データベース
```yaml
名称: phys-mech-db
タイプ: Azure Database for PostgreSQL Flexible Server
SKU: General Purpose D4s v3
仕様:
  - vCPU: 4
  - メモリ: 16GB
  - ストレージ: 512GB (自動拡張)
  - IOPS: 4800
バックアップ:
  - 保持期間: 35日
  - geo冗長: 有効
```

### 2.4 Redis Cache
```yaml
名称: phys-mech-cache
SKU: Premium P1
仕様:
  - メモリ: 6GB
  - レプリケーション: 有効
  - データ永続化: 有効
設定:
  - maxmemory-policy: allkeys-lru
  - notify-keyspace-events: KEA
```

### 2.5 Blob Storage
```yaml
名称: physmechstorage
SKU: Standard LRS
コンテナ:
  - mechanisms: メカニズムファイル
  - thumbnails: サムネイル画像
  - profiles: プロフィール画像
ライフサイクル管理:
  - アクセス層: ホット→クール (30日後)
  - アーカイブ: 180日後
```

## 3. ネットワーク設計

### 3.1 Virtual Network構成
```yaml
名称: phys-mech-vnet
アドレス空間: 10.0.0.0/16
サブネット:
  frontend:
    アドレス範囲: 10.0.1.0/24
    サービス: App Service (Frontend)
  backend:
    アドレス範囲: 10.0.2.0/24
    サービス: App Service (Backend)
  database:
    アドレス範囲: 10.0.3.0/24
    サービス: PostgreSQL, Redis
```

### 3.2 セキュリティ設定
```yaml
ネットワークセキュリティグループ:
  frontend-nsg:
    - 許可: HTTPS (443) from Internet
    - 許可: HTTP (80) from Internet → HTTPS リダイレクト
  backend-nsg:
    - 許可: HTTPS (443) from frontend subnet
    - 許可: Custom (8080) from frontend subnet
  database-nsg:
    - 許可: PostgreSQL (5432) from backend subnet
    - 許可: Redis (6380) from backend subnet
```

## 4. 可用性設計

### 4.1 冗長構成
```yaml
地理的冗長:
  プライマリリージョン: Japan East
  セカンダリリージョン: Japan West
  
コンポーネント冗長:
  - App Service: 最小2インスタンス
  - PostgreSQL: geo冗長バックアップ
  - Redis: レプリケーション有効
  - Storage: geo冗長ストレージ (GRS)
```

### 4.2 バックアップ戦略
```yaml
データベース:
  - フルバックアップ: 毎日
  - 差分バックアップ: 6時間ごと
  - トランザクションログ: 5分ごと
  - 保持期間: 35日

Blobストレージ:
  - バージョニング: 有効
  - 削除保護: 有効
  - ソフト削除: 7日
```

## 5. 監視設計

### 5.1 監視メトリクス
```yaml
Application Insights:
  - サーバーレスポンスタイム
  - リクエスト数
  - エラー率
  - 依存関係の応答時間

カスタムメトリクス:
  - メカニズムアップロード成功率
  - ユーザーセッション数
  - キャッシュヒット率
  - ストレージ使用量
```

### 5.2 アラート設定
```yaml
重大度: Critical
  - サーバーエラー率 > 1%
  - レスポンスタイム > 3秒
  - データベース接続エラー
  - SSL証明書期限切れ30日前

重大度: Warning
  - CPU使用率 > 80%
  - メモリ使用率 > 85%
  - ストレージ使用量 > 80%
  - キャッシュミス率 > 40%
```

## 6. コスト最適化

### 6.1 リソース最適化
```yaml
自動スケール:
  - 時間帯による調整
  - トラフィックパターンに基づく調整
  - 開発環境の夜間停止

ストレージ最適化:
  - ライフサイクル管理の活用
  - 不要データの自動クリーンアップ
  - 圧縮の活用
```

### 6.2 コスト見積もり
```yaml
月間見積もり:
  App Service (Frontend): ¥100,000
  App Service (Backend): ¥150,000
  PostgreSQL: ¥120,000
  Redis Cache: ¥50,000
  Blob Storage: ¥30,000
  その他 (CDN, 監視等): ¥50,000
  
予備費: 総額の20%
合計見積もり: ¥600,000/月
```

## 7. セキュリティ設計

### 7.1 暗号化設定
```yaml
転送時の暗号化:
  - TLS 1.2/1.3の強制
  - 強力な暗号スイートの使用
  - HSTS の有効化

保存時の暗号化:
  - データベース: TDE (Transparent Data Encryption)
  - Blobストレージ: AES-256
  - キャッシュ: Redis暗号化
```

### 7.2 アクセス制御
```yaml
認証:
  - Azure AD統合
  - MFA の強制
  - 条件付きアクセスポリシー

認可:
  - RBAC の実装
  - 最小権限の原則
  - JIT (Just-In-Time) アクセス
```

## 8. 運用設計

### 8.1 デプロイメント戦略
```yaml
CI/CD:
  - GitHub Actions との統合
  - Blue-Green デプロイメント
  - 自動化されたテスト

ロールバック計画:
  - 自動ロールバックトリガー
  - バージョン管理
  - 状態監視
```

### 8.2 メンテナンス計画
```yaml
定期メンテナンス:
  - セキュリティパッチ適用: 月1回
  - パフォーマンスチューニング: 四半期ごと
  - バックアップ検証: 月1回

障害復旧計画:
  - RTO: 4時間
  - RPO: 15分
  - 災害復旧訓練: 半年ごと
