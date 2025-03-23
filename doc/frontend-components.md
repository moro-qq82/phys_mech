# フロントエンドコンポーネント設計書

## 概要
本ドキュメントでは、物理機構共有プラットフォームの既存の実装に基づいたフロントエンドコンポーネント設計について記載します。メカニズムの表示レイアウトは、画面の1/3をメカニズムのリスト表示に、残りの2/3をプレビュー表示に割り当てる分割レイアウトを採用します。

## 1. コンポーネント構成

### 1.1 ページコンポーネント
```
src/
├── mechanism-sharing-platform.tsx  # メインプラットフォームページ
├── user-profile-page.tsx          # ユーザープロフィールページ
└── components/                    # 共通コンポーネント
```

## 2. コンポーネント仕様

### 2.1 MechanismSharingPlatform
```typescript
interface MechanismSharingPlatformProps {
  onNavigateToProfile: () => void;
}

// 状態管理
interface PlatformState {
  liked: boolean;
  currentPage: number;
  selectedCategories: number[];
  selectedReliabilityLevels: ReliabilityLevel[];
  sortBy: 'newest' | 'oldest' | 'popular' | 'views' | 'comments';
  searchQuery: string;
}

// メカニズムデータ型
interface Mechanism {
  id: number;
  title: string;
  description: string;
  likes: number;
  comments: number;
  views: number;
  createdAt: string;
  categories: number[];
  reliabilityLevel: ReliabilityLevel;
}

// 信頼性レベルの定義
type ReliabilityLevel = 
  | '妄想モデル'
  | '実験により一部支持'
  | '社内複数人が支持'
  | '顧客含めて定番認識化'
  | '教科書に記載';

const RELIABILITY_LEVELS: ReliabilityLevel[] = [
  '妄想モデル',
  '実験により一部支持',
  '社内複数人が支持',
  '顧客含めて定番認識化',
  '教科書に記載'
];
```

### 2.2 UserProfile
```typescript
interface UserProfileState {
  interests: string[];
  newInterest: string;
  selectedCategories: number[];
}

interface StatsData {
  day: string;
  views: number;
  likes: number;
  downloads: number;
}

interface Category {
  id: number;
  name: string;
}
```

## 3. 共通コンポーネント抽出

### 3.1 ナビゲーション
```typescript
// components/Navigation.tsx
interface NavigationProps {
  onSearch: (query: string) => void;
  onNavigateToProfile: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  onSearch,
  onNavigateToProfile
}) => {
  return (
    <nav className="bg-white shadow-sm w-full">
      {/* 既存のナビゲーション実装 */}
    </nav>
  );
};
```

### 3.2 メカニズムリスト項目
```typescript
// components/MechanismListItem.tsx
interface MechanismListItemProps {
  mechanism: Mechanism;
  onSelect: (mechanismId: string) => void;
  isSelected: boolean;
  onLike: () => void;
  liked: boolean;
}

const MechanismListItem: React.FC<MechanismListItemProps> = ({
  mechanism,
  onSelect,
  isSelected,
  onLike,
  liked
}) => {
  const reliabilityColorMap = {
    '妄想モデル': 'bg-purple-100 text-purple-600',
    '実験により一部支持': 'bg-yellow-100 text-yellow-600',
    '社内複数人が支持': 'bg-green-100 text-green-600',
    '顧客含めて定番認識化': 'bg-blue-100 text-blue-600',
    '教科書に記載': 'bg-black-100 text-black-600'
  };

  return (
    <div 
      className={`p-3 border-b cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
      }`}
      onClick={() => onSelect(mechanism.id)}
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
              onLike();
            }}
            className={`flex items-center space-x-1 ${liked ? 'text-red-500' : 'text-gray-500'}`}
          >
            <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} />
            <span className="text-xs">{mechanism.likes}</span>
          </button>
          
          <div className="flex items-center space-x-1 text-gray-500">
            <Download className="h-4 w-4" />
            <span className="text-xs">{mechanism.downloads || 0}</span>
          </div>
        </div>
        
        <span className={`px-2 py-0.5 rounded-md text-xs ${
          reliabilityColorMap[mechanism.reliabilityLevel]
        }`}>
          {mechanism.reliabilityLevel}
        </span>
      </div>
    </div>
  );
};
```

### 3.3 メカニズムプレビュー
```typescript
// components/MechanismPreview.tsx
interface MechanismPreviewProps {
  mechanism: Mechanism | null;
  onLike: () => void;
  liked: boolean;
}

const MechanismPreview: React.FC<MechanismPreviewProps> = ({
  mechanism,
  onLike,
  liked
}) => {
  if (!mechanism) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 border-l">
        <p className="text-gray-400">メカニズムを選択してください</p>
      </div>
    );
  }

  const reliabilityColorMap = {
    '妄想モデル': 'bg-purple-100 text-purple-600',
    '実験により一部支持': 'bg-yellow-100 text-yellow-600',
    '社内複数人が支持': 'bg-green-100 text-green-600',
    '顧客含めて定番認識化': 'bg-blue-100 text-blue-600',
    '教科書に記載': 'bg-black-100 text-black-600'
  };

  return (
    <div className="h-full flex flex-col bg-white border-l">
      <div className="relative">
        <img 
          src={mechanism.thumbnail_url} 
          alt={mechanism.title}
          className="w-full h-64 object-cover"
        />
        <span className={`absolute top-4 right-4 px-2 py-1 rounded-md text-sm ${
          reliabilityColorMap[mechanism.reliabilityLevel]
        }`}>
          {mechanism.reliabilityLevel}
        </span>
      </div>
      
      <div className="p-6 flex-grow overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{mechanism.title}</h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={onLike}
              className={`flex items-center space-x-1 ${liked ? 'text-red-500' : 'text-gray-500'}`}
            >
              <Heart className="h-5 w-5" fill={liked ? 'currentColor' : 'none'} />
              <span>{mechanism.likes}</span>
            </button>
            <button className="text-gray-500">
              <Download className="h-5 w-5" />
            </button>
            <button className="text-gray-500">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <span>投稿者: {mechanism.author}</span>
          <span className="mx-2">•</span>
          <span>{new Date(mechanism.createdAt).toLocaleDateString()}</span>
        </div>
        
        <p className="text-gray-700 mb-6">{mechanism.description}</p>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">カテゴリー</h3>
          <div className="flex flex-wrap gap-2">
            {mechanism.categories.map(category => (
              <span key={category} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                {category}
              </span>
            ))}
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-4">プレビュー</h3>
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            {/* ここにメカニズムのプレビュー（シミュレーションなど）を表示 */}
            <p className="text-gray-400">プレビューが利用可能です</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t">
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          ダウンロード
        </button>
      </div>
    </div>
  );
};
```

### 3.4 フィルターコンポーネント
```typescript
// components/Filters.tsx
interface FiltersProps {
  categories: Category[];
  selectedCategories: number[];
  onToggleCategory: (categoryId: number) => void;
  reliabilityLevels: ReliabilityLevel[];
  selectedReliabilityLevels: ReliabilityLevel[];
  onToggleReliability: (level: ReliabilityLevel) => void;
}

const Filters: React.FC<FiltersProps> = ({
  categories,
  selectedCategories,
  onToggleCategory,
  reliabilityLevels,
  selectedReliabilityLevels,
  onToggleReliability
}) => {
  return (
    <div className="space-y-4">
      {/* カテゴリーフィルター */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onToggleCategory(category.id)}
            className={`px-4 py-2 rounded-full text-sm ${
              selectedCategories.includes(category.id)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* 信頼性レベルフィルター */}
      <div className="flex flex-wrap gap-2">
        {reliabilityLevels.map(level => (
          <button
            key={level}
            onClick={() => onToggleReliability(level)}
            className={`px-4 py-2 rounded-full text-sm ${
              selectedReliabilityLevels.includes(level)
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### 3.5 統計グラフ
```typescript
// components/StatsChart.tsx
interface StatsChartProps {
  data: StatsData[];
}

const StatsChart: React.FC<StatsChartProps> = ({ data }) => {
  return (
    <div className="h-[400px] w-full">
      <LineChart
        width={1000}
        height={400}
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        {/* 既存のグラフ実装 */}
      </LineChart>
    </div>
  );
};
```

## 4. 状態管理パターン

### 4.1 ローカル状態
```typescript
// プラットフォームページの状態
const [liked, setLiked] = useState(false);
const [currentPage, setCurrentPage] = useState(1);
const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
const [selectedReliabilityLevels, setSelectedReliabilityLevels] = useState<ReliabilityLevel[]>([]);
const [sortBy, setSortBy] = useState<SortOption>('newest');
const [searchQuery, setSearchQuery] = useState('');
const [selectedMechanismId, setSelectedMechanismId] = useState<string | null>(null);
```

### 4.2 メモ化パターン
```typescript
// フィルタリングとソートのメモ化
const sortedAndFilteredMechanisms = useMemo(() => {
  let result = [...mechanisms];
  
  // カテゴリーフィルタリング
  if (selectedCategories.length > 0) {
    result = result.filter(mechanism => 
      mechanism.categories.some(cat => selectedCategories.includes(cat))
    );
  }

  // 信頼性レベルフィルタリング
  if (selectedReliabilityLevels.length > 0) {
    result = result.filter(mechanism =>
      selectedReliabilityLevels.includes(mechanism.reliabilityLevel)
    );
  }

  // 検索ロジック
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    result = result.filter(mechanism => 
      mechanism.title.toLowerCase().includes(query) ||
      mechanism.description.toLowerCase().includes(query)
    );
  }

  // ソートロジック
  switch (sortBy) {
    case 'newest':
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    // ... 他のソートケース
  }

  return result;
}, [mechanisms, selectedCategories, selectedReliabilityLevels, sortBy, searchQuery]);
```

## 5. スタイリング規約

### 5.1 共通クラス
```typescript
const commonStyles = {
  // ボタン
  button: {
    primary: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300',
  },
  
  // カード
  card: 'bg-white rounded-lg shadow-md overflow-hidden',
  
  // タグ
  tag: 'bg-blue-50 text-blue-600 px-3 py-1 rounded-full flex items-center space-x-2',
  
  // コンテナ
  container: 'max-w-6xl mx-auto px-4',
  
  // グリッド
  grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  
  // 分割レイアウト
  splitLayout: 'grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-64px)]',
  mechanismList: 'md:col-span-1 border-r overflow-y-auto h-full',
  mechanismPreview: 'md:col-span-2 h-full',

  // 信頼性レベルバッジ
  reliabilityBadge: {
    '妄想モデル': 'bg-purple-100 text-purple-600',
    '実験により一部支持': 'bg-yellow-100 text-yellow-600',
    '社内複数人が支持': 'bg-green-100 text-green-600',
    '顧客含めて定番認識化': 'bg-blue-100 text-blue-600',
    '教科書に記載': 'bg-black-100 text-black-600'
  }
};
```

## 6. アクセシビリティ

### 6.1 ARIA属性
```typescript
// 信頼性レベルフィルターのアクセシビリティ
<div role="group" aria-label="信頼性レベルフィルター">
  {reliabilityLevels.map(level => (
    <button
      key={level}
      aria-pressed={selectedReliabilityLevels.includes(level)}
      onClick={() => onToggleReliability(level)}
      className={`px-4 py-2 rounded-full text-sm ${
        selectedReliabilityLevels.includes(level)
          ? 'bg-green-600 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {level}
    </button>
  ))}
</div>

// メカニズムリストのアクセシビリティ
<div 
  role="listbox"
  aria-label="メカニズムリスト"
  className="mechanism-list"
>
  {mechanisms.map(mechanism => (
    <div
      key={mechanism.id}
      role="option"
      aria-selected={selectedMechanismId === mechanism.id}
      tabIndex={0}
      onClick={() => setSelectedMechanismId(mechanism.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setSelectedMechanismId(mechanism.id);
        }
      }}
    >
      {/* メカニズムリスト項目の内容 */}
    </div>
  ))}
</div>
## 7. 新しいレイアウト実装

### 7.1 分割レイアウト
メカニズム表示画面では、画面を1/3と2/3に分割し、左側にメカニズムのリスト、右側にプレビューを表示するレイアウトを採用します。

```typescript
// src/pages/MechanismsPage.tsx
const MechanismsPage: React.FC = () => {
  const [selectedMechanismId, setSelectedMechanismId] = useState<string | null>(null);
  const [mechanisms, setMechanisms] = useState<Mechanism[]>([]);
  // その他の状態...

  // 選択されたメカニズムを取得
  const selectedMechanism = useMemo(() => {
    return mechanisms.find(m => m.id === selectedMechanismId) || null;
  }, [mechanisms, selectedMechanismId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーション */}
      <nav className="bg-white shadow-sm w-full h-16">
        {/* ナビゲーションの内容 */}
      </nav>

      {/* フィルターエリア */}
      <div className="bg-white border-b p-4">
        {/* フィルターコンポーネント */}
      </div>

      {/* メインコンテンツ - 分割レイアウト */}
      <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-144px)]">
        {/* メカニズムリスト (1/3) */}
        <div className="md:col-span-1 border-r overflow-y-auto h-full">
          {mechanisms.map(mechanism => (
            <MechanismListItem
              key={mechanism.id}
              mechanism={mechanism}
              onSelect={setSelectedMechanismId}
              isSelected={selectedMechanismId === mechanism.id}
              onLike={() => handleLike(mechanism.id)}
              liked={likedMechanisms.includes(mechanism.id)}
            />
          ))}
        </div>

        {/* メカニズムプレビュー (2/3) */}
        <div className="md:col-span-2 h-full">
          <MechanismPreview
            mechanism={selectedMechanism}
            onLike={() => selectedMechanism && handleLike(selectedMechanism.id)}
            liked={selectedMechanism ? likedMechanisms.includes(selectedMechanism.id) : false}
          />
        </div>
      </div>
    </div>
  );
};
```

### 7.2 レスポンシブ対応
モバイル表示では、リストとプレビューを縦に積み重ねるレイアウトに切り替えます。

```typescript
// モバイル表示用の追加コンポーネント
const MobileViewToggle: React.FC<{
  view: 'list' | 'preview';
  setView: (view: 'list' | 'preview') => void;
}> = ({ view, setView }) => {
  return (
    <div className="flex border-b md:hidden">
      <button
        className={`flex-1 py-2 text-center ${
          view === 'list' ? 'border-b-2 border-blue-500 text-blue-600' : ''
        }`}
        onClick={() => setView('list')}
      >
        リスト
      </button>
      <button
        className={`flex-1 py-2 text-center ${
          view === 'preview' ? 'border-b-2 border-blue-500 text-blue-600' : ''
        }`}
        onClick={() => setView('preview')}
      >
        プレビュー
      </button>
    </div>
  );
};

// モバイル対応のメインレイアウト
const MechanismsPageResponsive: React.FC = () => {
  const [mobileView, setMobileView] = useState<'list' | 'preview'>('list');
  // その他の状態...

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ナビゲーション */}
      {/* フィルターエリア */}
      
      {/* モバイル表示切り替え */}
      <MobileViewToggle view={mobileView} setView={setMobileView} />
      
      {/* メインコンテンツ - 分割レイアウト */}
      <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-144px)]">
        {/* メカニズムリスト (1/3) - モバイルでは条件付き表示 */}
        <div className={`md:col-span-1 border-r overflow-y-auto h-full ${
          mobileView === 'list' || window.innerWidth >= 768 ? 'block' : 'hidden'
        }`}>
          {/* リスト内容 */}
        </div>

        {/* メカニズムプレビュー (2/3) - モバイルでは条件付き表示 */}
        <div className={`md:col-span-2 h-full ${
          mobileView === 'preview' || window.innerWidth >= 768 ? 'block' : 'hidden'
        }`}>
          {/* プレビュー内容 */}
        </div>
      </div>
    </div>
  );
};
```
