import React, { useState, useMemo } from 'react';
import { Heart, MessageCircle, Download, Share2, Search, ArrowUpDown, User, LogOut, Info } from 'lucide-react';
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
  author: string;
  downloads: number;
  reliabilityLevel: string;
}

const MechanismPlatform: React.FC<MechanismPlatformProps> = ({ onNavigateToProfile }) => {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState<AuthModalType>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [likedMechanisms, setLikedMechanisms] = useState<string[]>([]);
  const [selectedMechanismId, setSelectedMechanismId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<'list' | 'preview'>('list');
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

  // 信頼性レベルの定義
  const reliabilityLevels = [
    '妄想モデル',
    '実験により一部支持',
    '社内複数人が支持',
    '顧客含めて定番認識化',
    '教科書に記載'
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
    is_published: true,
    author: `ユーザー${Math.floor(Math.random() * 10) + 1}`,
    downloads: Math.floor(Math.random() * 100),
    reliabilityLevel: reliabilityLevels[Math.floor(Math.random() * reliabilityLevels.length)]
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

  // 選択されたメカニズムを取得
  const selectedMechanism = useMemo(() => {
    return sortedAndFilteredMechanisms.find(m => m.id === selectedMechanismId) || null;
  }, [sortedAndFilteredMechanisms, selectedMechanismId]);

  // いいねの切り替え
  const handleLike = (mechanismId: string) => {
    setLikedMechanisms(prev => 
      prev.includes(mechanismId)
        ? prev.filter(id => id !== mechanismId)
        : [...prev, mechanismId]
    );
  };

  // 初期選択（最初のメカニズムを選択）
  React.useEffect(() => {
    if (sortedAndFilteredMechanisms.length > 0 && !selectedMechanismId) {
      setSelectedMechanismId(sortedAndFilteredMechanisms[0].id);
    }
  }, [sortedAndFilteredMechanisms, selectedMechanismId]);

  // 信頼性レベルのカラーマップ
  const reliabilityColorMap: Record<string, string> = {
    '妄想モデル': 'bg-purple-100 text-purple-600',
    '実験により一部支持': 'bg-yellow-100 text-yellow-600',
    '社内複数人が支持': 'bg-green-100 text-green-600',
    '顧客含めて定番認識化': 'bg-blue-100 text-blue-600',
    '教科書に記載': 'bg-black-100 text-black-600'
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

      {/* モバイル表示切り替え */}
      <div className="flex border-b md:hidden">
        <button
          className={`flex-1 py-2 text-center ${
            mobileView === 'list' ? 'border-b-2 border-blue-500 text-blue-600' : ''
          }`}
          onClick={() => setMobileView('list')}
        >
          リスト
        </button>
        <button
          className={`flex-1 py-2 text-center ${
            mobileView === 'preview' ? 'border-b-2 border-blue-500 text-blue-600' : ''
          }`}
          onClick={() => setMobileView('preview')}
        >
          プレビュー
        </button>
      </div>

      {/* Main Content - Split Layout */}
      <main className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-144px)]">
        {/* メカニズムリスト (1/3) */}
        <div className={`md:col-span-1 border-r overflow-y-auto h-full ${
          mobileView === 'list' || window.innerWidth >= 768 ? 'block' : 'hidden'
        }`}>
          {sortedAndFilteredMechanisms.map(mechanism => (
            <div 
              key={mechanism.id} 
              className={`p-3 border-b cursor-pointer transition-colors ${
                selectedMechanismId === mechanism.id 
                  ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedMechanismId(mechanism.id)}
            >
              <h3 className="text-md font-semibold mb-1 truncate">{mechanism.title}</h3>
              <div className="flex items-center text-xs text-gray-500 mb-2">
                <span>投稿者: {mechanism.author}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(mechanism.id);
                    }}
                    className={`flex items-center space-x-1 ${
                      likedMechanisms.includes(mechanism.id) ? 'text-red-500' : 'text-gray-500'
                    }`}
                  >
                    <Heart 
                      className="h-4 w-4" 
                      fill={likedMechanisms.includes(mechanism.id) ? 'currentColor' : 'none'} 
                    />
                    <span className="text-xs">{mechanism.likes}</span>
                  </button>
                  
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Download className="h-4 w-4" />
                    <span className="text-xs">{mechanism.downloads}</span>
                  </div>
                </div>
                
                <span className={`px-2 py-0.5 rounded-md text-xs ${
                  reliabilityColorMap[mechanism.reliabilityLevel]
                }`}>
                  {mechanism.reliabilityLevel}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* メカニズムプレビュー (2/3) */}
        <div className={`md:col-span-2 h-full ${
          mobileView === 'preview' || window.innerWidth >= 768 ? 'block' : 'hidden'
        }`}>
          {selectedMechanism ? (
            <div className="h-full flex flex-col bg-white border-l">
              <div className="relative">
                <img 
                  src="/api/placeholder/800/400" 
                  alt={selectedMechanism.title}
                  className="w-full h-64 object-cover"
                />
                <span className={`absolute top-4 right-4 px-2 py-1 rounded-md text-sm ${
                  reliabilityColorMap[selectedMechanism.reliabilityLevel]
                }`}>
                  {selectedMechanism.reliabilityLevel}
                </span>
              </div>
              
              <div className="p-6 flex-grow overflow-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{selectedMechanism.title}</h2>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleLike(selectedMechanism.id)}
                      className={`flex items-center space-x-1 ${
                        likedMechanisms.includes(selectedMechanism.id) ? 'text-red-500' : 'text-gray-500'
                      }`}
                    >
                      <Heart 
                        className="h-5 w-5" 
                        fill={likedMechanisms.includes(selectedMechanism.id) ? 'currentColor' : 'none'} 
                      />
                      <span>{selectedMechanism.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-500">
                      <MessageCircle className="h-5 w-5" />
                      <span>{selectedMechanism.comments}</span>
                    </button>
                    <button className="text-gray-500">
                      <Share2 className="h-5 w-5" />
                    </button>
                    <button className="text-gray-500">
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <span>投稿者: {selectedMechanism.author}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(selectedMechanism.createdAt).toLocaleDateString()}</span>
                </div>
                
                <p className="text-gray-700 mb-6">{selectedMechanism.description}</p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-2">カテゴリー</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMechanism.categories.map(categoryId => {
                      const category = categories.find(c => c.id === categoryId);
                      return (
                        <span key={categoryId} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {category ? category.name : categoryId}
                        </span>
                      );
                    })}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4">プレビュー</h3>
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">プレビューが利用可能です</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t">
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                  ダウンロード
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 border-l">
              <p className="text-gray-400">メカニズムを選択してください</p>
            </div>
          )}
        </div>
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
