import express from 'express';
import { authenticateToken } from '../middleware/auth';
import Mechanism from '../models/Mechanism';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// メカニズム一覧取得
router.get('/', async (req, res) => {
  try {
    const mechanisms = await Mechanism.findAll({
      where: {
        is_published: true
      },
      order: [['created_at', 'DESC']]
    });
    
    return res.status(200).json(mechanisms);
  } catch (error) {
    console.error('メカニズム一覧取得エラー:', error);
    return res.status(500).json({ error: 'メカニズム一覧の取得に失敗しました。' });
  }
});

// メカニズム詳細取得
router.get('/:id', async (req, res) => {
  try {
    const mechanism = await Mechanism.findByPk(req.params.id);
    
    if (!mechanism) {
      return res.status(404).json({ error: 'メカニズムが見つかりません。' });
    }
    
    return res.status(200).json(mechanism);
  } catch (error) {
    console.error('メカニズム詳細取得エラー:', error);
    return res.status(500).json({ error: 'メカニズム詳細の取得に失敗しました。' });
  }
});

// メカニズム作成
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      file_url,
      thumbnail_url,
      duration,
      categories,
      is_published
    } = req.body;
    
    // 必須項目のバリデーション
    if (!title || !description || !file_url) {
      return res.status(400).json({ error: '必須項目が不足しています。' });
    }
    
    // メカニズムの作成
    const mechanism = await Mechanism.create({
      id: uuidv4(),
      user_id: req.user?.id || '', // authMiddlewareで設定されたユーザーID
      title,
      description,
      file_url,
      thumbnail_url: thumbnail_url || null,
      duration: duration || 0,
      is_published: is_published || false
    });
    
    // カテゴリーの関連付け
    if (categories && categories.length > 0) {
      await mechanism.setCategories(categories);
    }
    
    return res.status(201).json(mechanism);
  } catch (error) {
    console.error('メカニズム作成エラー:', error);
    return res.status(500).json({ error: 'メカニズムの作成に失敗しました。' });
  }
});

// メカニズム更新
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const mechanism = await Mechanism.findByPk(req.params.id);
    
    if (!mechanism) {
      return res.status(404).json({ error: 'メカニズムが見つかりません。' });
    }
    
    // 所有者チェック
    if (mechanism.user_id !== req.user?.id) {
      return res.status(403).json({ error: '更新権限がありません。' });
    }
    
    const {
      title,
      description,
      file_url,
      thumbnail_url,
      duration,
      categories,
      is_published
    } = req.body;
    
    // メカニズムの更新
    await mechanism.update({
      title: title || mechanism.title,
      description: description || mechanism.description,
      file_url: file_url || mechanism.file_url,
      thumbnail_url: thumbnail_url !== undefined ? thumbnail_url : mechanism.thumbnail_url,
      duration: duration !== undefined ? duration : mechanism.duration,
      is_published: is_published !== undefined ? is_published : mechanism.is_published
    });
    
    // カテゴリーの更新
    if (categories && categories.length > 0) {
      await mechanism.setCategories(categories);
    }
    
    return res.status(200).json(mechanism);
  } catch (error) {
    console.error('メカニズム更新エラー:', error);
    return res.status(500).json({ error: 'メカニズムの更新に失敗しました。' });
  }
});

// メカニズム削除
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const mechanism = await Mechanism.findByPk(req.params.id);
    
    if (!mechanism) {
      return res.status(404).json({ error: 'メカニズムが見つかりません。' });
    }
    
    // 所有者チェック
    if (mechanism.user_id !== req.user?.id) {
      return res.status(403).json({ error: '削除権限がありません。' });
    }
    
    await mechanism.destroy();
    
    return res.status(204).send();
  } catch (error) {
    console.error('メカニズム削除エラー:', error);
    return res.status(500).json({ error: 'メカニズムの削除に失敗しました。' });
  }
});

export default router;
