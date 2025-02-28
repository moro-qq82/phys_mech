import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Requestインターフェースを拡張してuserプロパティを追加
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '認証が必要です' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      id: string;
      email: string;
    };
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: '無効なトークンです' });
  }
};
