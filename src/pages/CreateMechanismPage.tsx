import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateMechanismModal from '../components/mechanism/CreateMechanismModal';

const CreateMechanismPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // 仮のカテゴリーデータ（後でAPIから取得するように変更予定）
  const categories = [
    { id: '1', name: '機械要素' },
    { id: '2', name: '動力伝達' },
    { id: '3', name: '制御機構' },
    { id: '4', name: '産業機械' }
  ];

  const handleSubmit = async (data: any) => {
    try {
      // TODO: APIを呼び出してメカニズムを保存
      console.log('Submitting mechanism:', data);
      
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
