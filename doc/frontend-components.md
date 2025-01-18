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
}
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
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* 既存のカード実装 */}
    </div>
  );
};
```

### 3.3 カテゴリーフィルター
```typescript
// components/CategoryFilter.tsx
interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: number[];
  onToggleCategory: (categoryId: number) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategories,
  onToggleCategory
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {/* 既存のフィルター実装 */}
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

### 3.5 インタレストタグ
```typescript
// components/InterestTags.tsx
interface InterestTagsProps {
  interests: string[];
  onRemove: (interest: string) => void;
  onAdd: (interest: string) => void;
}

const InterestTags: React.FC<InterestTagsProps> = ({
  interests,
  onRemove,
  onAdd
}) => {
  return (
    <div>
      {/* 既存のタグ実装 */}
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
const [sortBy, setSortBy] = useState<SortOption>('newest');
const [searchQuery, setSearchQuery] = useState('');

// プロフィールページの状態
const [interests, setInterests] = useState<string[]>([]);
const [newInterest, setNewInterest] = useState('');
const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
```

### 4.2 メモ化パターン
```typescript
// フィルタリングとソートのメモ化
const sortedAndFilteredMechanisms = useMemo(() => {
  let result = [...mechanisms];
  
  // フィルタリングロジック
  if (selectedCategories.length > 0) {
    result = result.filter(mechanism => 
      mechanism.categories.some(cat => selectedCategories.includes(cat))
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
}, [mechanisms, selectedCategories, sortBy, searchQuery]);
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
};
```

## 6. パフォーマンス最適化

### 6.1 ページネーション
```typescript
const itemsPerPage = 6;
const totalPages = Math.ceil(filteredMechanisms.length / itemsPerPage);
const currentMechanisms = filteredMechanisms.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);
```

### 6.2 遅延読み込み
```typescript
// 画像の遅延読み込み
<img 
  src="/api/placeholder/400/300" 
  alt="メカニズムのプレビュー" 
  className="w-full h-48 object-cover"
  loading="lazy"
/>
```

## 7. エラーハンドリング

### 7.1 データ取得エラー
```typescript
const [error, setError] = useState<Error | null>(null);

if (error) {
  return (
    <div className="text-red-600 bg-red-100 p-4 rounded-lg">
      <h3 className="font-bold">エラーが発生しました</h3>
      <p>{error.message}</p>
    </div>
  );
}
```

### 7.2 入力バリデーション
```typescript
const validateInterest = (interest: string): boolean => {
  if (!interest.trim()) {
    return false;
  }
  if (interests.includes(interest.trim())) {
    return false;
  }
  return true;
};
```

## 8. アクセシビリティ

### 8.1 ARIA属性
```typescript
// ボタンとフォーム要素のアクセシビリティ
<button
  aria-label="いいねする"
  onClick={onLike}
  className={`flex items-center space-x-1 ${liked ? 'text-red-500' : 'text-gray-500'}`}
>
  <Heart className="h-5 w-5" fill={liked ? 'currentColor' : 'none'} />
  <span>{likes}</span>
</button>

<input
  type="text"
  aria-label="メカニズムを検索"
  placeholder="メカニズムを検索..."
  className="w-48 md:w-64 pl-10 pr-4 py-2 border rounded-lg"
  value={searchQuery}
  onChange={handleSearch}
/>
