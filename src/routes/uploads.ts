import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// ファイルストレージの設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // ファイル名を一意にするためにUUIDを使用
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// ファイルフィルターの設定
const fileFilter = (req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 許可するファイルタイプ
  const allowedFileTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip'
  ];

  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('許可されていないファイル形式です。'));
  }
};

// multerの設定
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// ファイルアップロードエンドポイント
router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ファイルがアップロードされていません。' });
    }

    // ファイルのURLを生成
    const fileUrl = `/uploads/${req.file.filename}`;
    
    // ファイルの種類に応じて処理
    const isImage = req.file.mimetype.startsWith('image/');
    
    // 画像ファイルの場合は、durationを0に設定
    // 他のファイルタイプの場合は、実際の処理を追加する必要があります
    const duration = isImage ? 0 : 0; // 仮の値として0を設定
    
    return res.status(200).json({
      url: fileUrl,
      duration,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('ファイルアップロードエラー:', error);
    return res.status(500).json({ error: 'ファイルのアップロードに失敗しました。' });
  }
});

export default router;
