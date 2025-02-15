import React, { useState, FormEvent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Tag, Plus, X } from 'lucide-react';

interface Category {
  id: number;
  name: string;
}

interface StatsData {
  day: string;
  views: number;
  likes: number;
  downloads: number;
}

const UserProfile = () => {
  const [interests, setInterests] = useState<string[]>(['量子コンピュータ', '流体力学', '熱力学']);
  const [newInterest, setNewInterest] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([1, 4]);

  // サンプルの統計データ
  const statsData: StatsData[] = Array(30).fill(null).map((_, i) => ({
    day: `${i + 1}日`,
    views: Math.floor(Math.random() * 500) + 100,
    likes: Math.floor(Math.random() * 100) + 10,
    downloads: Math.floor(Math.random() * 50) + 5,
  }));

  const categories: Category[] = [
    { id: 1, name: '力学' },
    { id: 2, name: '電磁気学' },
    { id: 3, name: '熱力学' },
    { id: 4, name: '波動' },
    { id: 5, name: '量子力学' },
    { id: 6, name: '相対性理論' },
  ];

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const addInterest = (e: FormEvent) => {
    e.preventDefault();
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* プロフィールヘッダー */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-2xl text-gray-600">YN</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">山田直人</h1>
              <p className="text-gray-600">物理学研究者 / エンジニア</p>
            </div>
          </div>
        </div>

        {/* 興味のあるカテゴリー */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">興味のあるカテゴリー</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
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
        </div>

        {/* 興味対象タグ */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">興味のある研究対象</h2>
          <form onSubmit={addInterest} className="mb-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                placeholder="新しい研究対象を追加"
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </form>
          <div className="flex flex-wrap gap-2">
            {interests.map(interest => (
              <div
                key={interest}
                className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full flex items-center space-x-2"
              >
                <Tag className="h-4 w-4" />
                <span>{interest}</span>
                <button
                  onClick={() => removeInterest(interest)}
                  className="hover:text-blue-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 統計グラフ */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">投稿コンテンツの統計</h2>
          <div className="h-[400px] w-full">
            <LineChart
              width={1000}
              height={400}
              data={statsData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#8884d8" name="閲覧数" />
              <Line type="monotone" dataKey="likes" stroke="#82ca9d" name="いいね数" />
              <Line type="monotone" dataKey="downloads" stroke="#ffc658" name="ダウンロード数" />
            </LineChart>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
