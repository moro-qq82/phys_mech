import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateNew = () => {
    navigate('/create-mechanism');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">メカニズム共有プラットフォーム</h1>
          <button
            onClick={handleCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4" 
              />
            </svg>
            新規投稿
          </button>
        </div>
        
        {/* ここに投稿一覧を表示するコンポーネントを追加予定 */}
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">投稿一覧がここに表示されます</p>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
