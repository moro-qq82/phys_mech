# フロントエンドコンポーネント設計書

## 概要
本ドキュメントでは、物理機構共有プラットフォームの既存の実装に基づいたフロントエンドコンポーネント設計について記載します。

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

### 3.2 メカニズムカード
```typescript
// components/MechanismCard.tsx
interface MechanismCardProps {
  mechanism: Mechanism;
  onLike: () => void;
  liked: boolean;
}

const MechanismCard: React.FC<MechanismCardProps> = ({
  mechanism,
  onLike,
  liked
}) => {
  const reliabilityColorMap = {
    '妄想モデル': 'bg-gray-100 text-gray-600',
    '実験により一部支持': 'bg-blue-100 text-blue-600',
    '社内複数人が支持': 'bg-green-100 text-green-600',
    '顧客含めて定番認識化': 'bg-purple-100 text-purple-600',
    '教科書に記載': 'bg-yellow-100 text-yellow-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img 
          src={mechanism.thumbnail_url} 
          alt={mechanism.title}
          className="w-full h-48 object-cover"
        />
        <span className={`absolute top-2 right-2 px-2 py-1 rounded-md text-sm ${
          reliabilityColorMap[mechanism.reliabilityLevel]
        }`}>
          {mechanism.reliabilityLevel}
        </span>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{mechanism.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{mechanism.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onLike}
              className={`flex items-center space-x-1 ${liked ? 'text-red-500' : 'text-gray-500'}`}
            >
              <Heart className="h-5 w-5" fill={liked ? 'currentColor' : 'none'} />
              <span>{mechanism.likes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 3.3 フィルターコンポーネント
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

### 3.4 統計グラフ
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

  // 信頼性レベルバッジ
  reliabilityBadge: {
    '妄想モデル': 'bg-gray-100 text-gray-600',
    '実験により一部支持': 'bg-blue-100 text-blue-600',
    '社内複数人が支持': 'bg-green-100 text-green-600',
    '顧客含めて定番認識化': 'bg-purple-100 text-purple-600',
    '教科書に記載': 'bg-yellow-100 text-yellow-600'
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
