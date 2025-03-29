import express from 'express';
import { Request, Response } from 'express';
import Category from '../models/Category';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// カテゴリー一覧を取得
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    res.json(categories);
  } catch (error) {
    console.error('カテゴリー一覧の取得に失敗:', error);
    res.status(500).json({ message: 'カテゴリー一覧の取得に失敗しました' });
  }
});

// 新規カテゴリーを作成
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'カテゴリー名は必須です' });
    }

    // 同じ名前のカテゴリーが存在するかチェック
    const existingCategory = await Category.findOne({
      where: { name }
    });

    if (existingCategory) {
      return res.status(400).json({ message: '同じ名前のカテゴリーが既に存在します' });
    }

    const category = await Category.create({
      name,
      description,
      created_by: req.user?.id,
      is_system: false
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('カテゴリーの作成に失敗:', error);
    res.status(500).json({ message: 'カテゴリーの作成に失敗しました' });
  }
});

export default router;
