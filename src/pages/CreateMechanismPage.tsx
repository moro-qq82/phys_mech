import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateMechanismModal from '../components/mechanism/CreateMechanismModal';

interface Category {
  id: string;
  name: string;
}

const CreateMechanismPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // カテゴリーデータをAPIから取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('カテゴリーの取得に失敗しました');
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('カテゴリー取得エラー:', err);
        // エラーが発生した場合はデフォルトのカテゴリーを使用
        setCategories([
          { id: '1', name: '機械要素' },
          { id: '2', name: '動力伝達' },
          { id: '3', name: '制御機構' },
          { id: '4', name: '産業機械' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (data: any) => {
    try {
      // APIを呼び出してメカニズムを保存
      const response = await fetch('/api/mechanisms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          file_url: data.file_url,
          thumbnail_url: data.thumbnail_url,
          duration: data.duration,
          categories: data.categories,
          is_published: data.is_published
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '投稿に失敗しました');
      }
      
      // 成功したらメインページに戻る
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿に失敗しました');
      throw err;
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">読み込み中...</div>;
  }

  return (
    <CreateMechanismModal
      isOpen={true}
      onClose={handleClose}
      onSubmit={handleSubmit}
      categories={categories}
    />
  );
};

export default CreateMechanismPage;
