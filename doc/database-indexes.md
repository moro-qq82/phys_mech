# データベースインデックス設計書

## 概要
本ドキュメントでは、物理機構共有プラットフォームのデータベースインデックス設計について記載します。

## インデックス設計方針
1. プライマリキーインデックスは自動的に作成されるため、明示的な作成は不要
2. 外部キーには必ずインデックスを作成し、参照整合性を担保
3. 検索・フィルタリングで頻繁に使用されるカラムにインデックスを作成
4. 複合インデックスは、WHERE句とORDER BY句の両方で使用される組み合わせに作成

## テーブル別インデックス設計

### Users テーブル
1. email_idx (UNIQUE)
   - カラム: email
   - 理由: ユーザーログイン時の検索、メールアドレスの一意性確保

2. username_idx (UNIQUE)
   - カラム: username
   - 理由: ユーザー名での検索、ユーザー名の一意性確保

3. created_at_idx
   - カラム: created_at
   - 理由: 新規ユーザー一覧の取得、登録日時でのソート

### Mechanisms テーブル
1. user_id_created_at_idx
   - カラム: (user_id, created_at)
   - 理由: ユーザーごとの機構一覧取得、作成日時でのソート

2. created_at_idx
   - カラム: created_at
   - 理由: 新着機構一覧の取得、ページネーション

3. title_idx
   - カラム: title
   - 理由: タイトルでの検索機能

4. is_published_created_at_idx
   - カラム: (is_published, created_at)
   - 理由: 公開済み機構の一覧取得、作成日時でのソート

5. category_duration_idx
   - カラム: (duration)
   - 理由: 動画時間でのフィルタリング・ソート

6. stats_idx
   - カラム: (is_published, created_at, updated_at)
   - 理由: 統計情報の時系列データ取得、パフォーマンス最適化

### Categories テーブル
1. name_idx (UNIQUE)
   - カラム: name
   - 理由: カテゴリー名の一意性確保、名前での検索

2. created_by_idx
   - カラム: created_by
   - 理由: ユーザーが作成したカテゴリーの一覧取得

3. system_created_at_idx
   - カラム: (is_system, created_at)
   - 理由: システムカテゴリーとユーザー作成カテゴリーの区別、作成日時でのソート

4. user_categories_idx
   - カラム: (created_by, is_system, created_at)
   - 理由: ユーザーごとのカテゴリー管理、フィルタリングとソートの最適化

### MechanismCategories テーブル
1. mechanism_id_idx
   - カラム: mechanism_id
   - 理由: 機構に関連付けられたカテゴリーの取得

2. category_id_idx
   - カラム: category_id
   - 理由: カテゴリーに属する機構の取得

### UserCategories テーブル
1. user_id_idx
   - カラム: user_id
   - 理由: ユーザーの興味カテゴリー取得

2. category_id_idx
   - カラム: category_id
   - 理由: カテゴリーに興味を持つユーザーの取得

### UserInterests テーブル
1. user_id_idx
   - カラム: user_id
   - 理由: ユーザーの興味一覧取得

2. interest_name_idx
   - カラム: interest_name
   - 理由: 興味名での検索

### Likes テーブル
1. user_id_created_at_idx
   - カラム: (user_id, created_at)
   - 理由: ユーザーのいいね履歴取得

2. mechanism_id_created_at_idx
   - カラム: (mechanism_id, created_at)
   - 理由: 機構のいいね一覧取得

3. user_mechanism_idx (UNIQUE)
   - カラム: (user_id, mechanism_id)
   - 理由: 重複いいねの防止

### Comments テーブル
1. user_id_created_at_idx
   - カラム: (user_id, created_at)
   - 理由: ユーザーのコメント履歴取得

2. mechanism_id_created_at_idx
   - カラム: (mechanism_id, created_at)
   - 理由: 機構のコメント一覧取得、作成日時でのソート

### Downloads テーブル
1. user_id_created_at_idx
   - カラム: (user_id, created_at)
   - 理由: ユーザーのダウンロード履歴取得

2. mechanism_id_created_at_idx
   - カラム: (mechanism_id, created_at)
   - 理由: 機構のダウンロード履歴取得

### Views テーブル
1. mechanism_id_created_at_idx
   - カラム: (mechanism_id, created_at)
   - 理由: 機構の閲覧履歴取得、時系列分析

2. session_id_idx
   - カラム: session_id
   - 理由: セッションごとの閲覧履歴取得

3. stats_idx
   - カラム: (mechanism_id, created_at, ip_address)
   - 理由: アクセス統計の集計、地域別分析

## クエリパターンとインデックス最適化

### ページネーション最適化
1. キーセットページネーション
   - created_at + id による複合インデックスを使用
   - 例: WHERE (created_at, id) < (last_created_at, last_id) ORDER BY created_at DESC, id DESC LIMIT 20

### 統計情報クエリ最適化
1. 時系列データ集計
   - 各テーブルのcreated_atインデックスを活用
   - パーティショニングの検討（月次など）

2. リアルタイムカウンター
   - Redisなどの外部キャッシュの使用を推奨
   - 定期的なバッチ処理での同期

## パフォーマンスに関する注意事項

1. 複合インデックスは、先頭のカラムから順に使用される
   - WHERE句やORDER BY句で使用される順序を考慮してカラムの順序を決定

2. インデックスのメンテナンス
   - 定期的なINDEX STATISTICS の更新
   - 断片化したインデックスの再構築

3. モニタリング
   - スロークエリログの監視
   - インデックスの使用状況の確認
   - 必要に応じてインデックスの追加・削除を検討
