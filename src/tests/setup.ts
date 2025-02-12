import { sequelize } from '../config/database';

beforeAll(async () => {
  // テストデータベースに接続
  try {
    await sequelize.authenticate();
    // テーブルを作成（既存のテーブルは削除）
    await sequelize.sync({ force: true });
  } catch (error) {
    console.error('テストデータベースの接続に失敗しました:', error);
    throw error;
  }
});

afterAll(async () => {
  // テストデータベースの接続を閉じる
  await sequelize.close();
});

// 各テストの前にテーブルをクリーンアップ
beforeEach(async () => {
  await sequelize.truncate({ cascade: true });
});
