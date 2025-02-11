import React, { useState, useMemo } from 'react';
import { Heart, MessageCircle, Download, Share2, Search, ArrowUpDown, User, LogOut } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import CreateMechanismModal from './components/mechanism/CreateMechanismModal';

interface MechanismPlatformProps {
  onNavigateToProfile: () => void;
}

type AuthModalType = 'login' | 'register' | null;

interface Mechanism {
  id: string;
  title: string;
  description: string;
  likes: number;
  comments: number;
  views: number;
  createdAt: string;
  categories: string[];
  file_url: string;
  thumbnail_url: string;
  duration: number;
  is_published: boolean;
}

const MechanismPlatform: React.FC<MechanismPlatformProps> = ({ onNavigateToProfile }) => {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState<AuthModalType>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [liked, setLiked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'views' | 'comments'>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Category data
  const categories = [
    { id: 'mechanics', name: '力学' },
    { id: 'em', name: '電磁気学' },
    { id: 'thermo', name: '熱力学' },
    { id: 'wave', name: '波動' },
    { id: 'quantum', name: '量子力学' },
    { id: 'relativity', name: '相対性理論' },
  ];

  // Sample mechanism data
  const rawMechanisms: Mechanism[] = Array(12).fill(null).map((_, index) => ({
    id: `mech-${index + 1}`,
    title: `物理メカニズム ${index + 1}`,
    description: '物理現象の可視化とシミュレーション',
    likes: Math.floor(Math.random() * 200),
    comments: Math.floor(Math.random() * 50),
    views: Math.floor(Math.random() * 1000),
    createdAt: new Date(2024, 0, index + 1).toISOString(),
    categories: [categories[Math.floor(Math.random() * categories.length)].id],
    file_url: `/files/mechanism-${index + 1}.pdf`,
    thumbnail_url: `/thumbnails/mechanism-${index + 1}.jpg`,
    duration: Math.floor(Math.random() * 300),
    is_published: true
  }));

  // Sort options
  const sortOptions = [
    { value: 'newest', label: '新着順' },
    { value: 'oldest', label: '古い順' },
    { value: 'popular', label: 'いいね数順' },
    { value: 'views', label: '閲覧数順' },
    { value: 'comments', label: 'コメント数順' },
  ];

  // Filtered and sorted mechanisms
  const sortedAndFilteredMechanisms = useMemo(() => {
    let result = [...rawMechanisms];

    if (selectedCategories.length > 0) {
      result = result.filter(mechanism => 
        mechanism.categories.some(cat => selectedCategories.includes(cat))
      );
    }


    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(mechanism => 
        mechanism.title.toLowerCase().includes(query) ||
        mechanism.description.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'popular':
        result.sort((a, b) => b.likes - a.likes);
        break;
      case 'views':
        result.sort((a, b) => b.views - a.views);
        break;
      case 'comments':
        result.sort((a, b) => b.comments - a.comments);
        break;
      default:
        break;
    }

    return result;
  }, [rawMechanisms, selectedCategories, sortBy, searchQuery]);

  // Pagination
  const itemsPerPage = 6;
  const totalPages = Math.ceil(sortedAndFilteredMechanisms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMechanisms = sortedAndFilteredMechanisms.slice(startIndex, endIndex);

  // Page change handler
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm w-full">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-blue-600">PhysMech</div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="メカニズムを検索..." 
                  className="w-48 md:w-64 pl-10 pr-4 py-2 border rounded-lg"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            {user ? (
              <>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  投稿する
                </button>
                <button 
                  onClick={onNavigateToProfile}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                </button>
                <button
                  onClick={logout}
                  className="p-2 rounded-full hover:bg-gray-100"
                  title="ログアウト"
                >
                  <LogOut className="h-5 w-5 text-gray-600" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowAuthModal('login')}
                  className="text-blue-600 hover:text-blue-700"
                >
                  ログイン
                </button>
                <button
                  onClick={() => setShowAuthModal('register')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  新規登録
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      </nav>

      {/* Filters and Sort */}
      <div className="container mx-auto px-4 py-4">
      <div className="flex flex-col space-y-4">
        {/* カテゴリーフィルター */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategories(prev => 
                  prev.includes(category.id)
                    ? prev.filter(id => id !== category.id)
                    : [...prev, category.id]
                );
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedCategories.includes(category.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

          <div className="flex items-center space-x-2">
            <ArrowUpDown className="h-5 w-5 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'newest' | 'oldest' | 'popular' | 'views' | 'comments');
                setCurrentPage(1);
              }}
              className="border rounded-lg px-3 py-2 bg-white"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentMechanisms.map(mechanism => (
            <div key={mechanism.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <img 
                  src="/api/placeholder/400/300" 
                  alt="メカニズムのプレビュー" 
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                  {Math.floor(mechanism.duration / 60)}:{(mechanism.duration % 60).toString().padStart(2, '0')}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{mechanism.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{mechanism.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setLiked(!liked)}
                      className={`flex items-center space-x-1 ${liked ? 'text-red-500' : 'text-gray-500'}`}
                    >
                      <Heart className="h-5 w-5" fill={liked ? 'currentColor' : 'none'} />
                      <span>{mechanism.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-500">
                      <MessageCircle className="h-5 w-5" />
                      <span>{mechanism.comments}</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="text-gray-500">
                      <Share2 className="h-5 w-5" />
                    </button>
                    <button className="text-gray-500">
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-blue-600 hover:bg-blue-50'
              }`}
            >
              前へ
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-blue-600 hover:bg-blue-50'
              }`}
            >
              次へ
            </button>
          </div>
        )}
      </main>

      {/* 認証モーダル */}
      {showAuthModal === 'login' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">ログイン</h2>
            <LoginForm onSuccess={() => setShowAuthModal(null)} />
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAuthModal('register')}
                className="text-blue-600 hover:text-blue-700"
              >
                アカウントをお持ちでない方はこちら
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthModal === 'register' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">新規登録</h2>
            <RegisterForm onSuccess={() => setShowAuthModal(null)} />
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAuthModal('login')}
                className="text-blue-600 hover:text-blue-700"
              >
                すでにアカウントをお持ちの方はこちら
              </button>
            </div>
          </div>
        </div>
      )}

      {/* メカニズム投稿モーダル */}
      <CreateMechanismModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data) => {
          try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/v1/mechanisms', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                title: data.title,
                description: data.description,
                categories: data.categories,
                file_url: data.file_url,
                thumbnail_url: data.thumbnail_url,
                duration: data.duration,
                is_published: data.is_published
              })
            });

            if (!response.ok) {
              throw new Error('投稿に失敗しました');
            }

            // 投稿成功後の処理
            // TODO: メカニズム一覧を更新する
          } catch (err) {
            console.error('Failed to create mechanism:', err);
            throw err;
          }
        }}
        categories={categories}
      />
    </div>
  );
};

export default MechanismPlatform;
