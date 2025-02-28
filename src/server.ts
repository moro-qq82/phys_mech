import express from 'express';
import cors from 'cors';
import { sequelize } from './config/database';
import categoryRoutes from './routes/categories';

const app = express();
const port = process.env.PORT || 3001;

// ミドルウェアの設定
app.use(cors());
app.use(express.json());

// ルートの登録
app.use('/api/categories', categoryRoutes);

// データベース接続とサーバー起動
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('データベースに接続しました。');

    // マイグレーションの実行
    await sequelize.sync();
    console.log('データベースを同期しました。');

    app.listen(port, () => {
      console.log(`サーバーが http://localhost:${port} で起動しました`);
    });
  } catch (error) {
    console.error('サーバーの起動に失敗しました:', error);
    process.exit(1);
  }
};

startServer();
