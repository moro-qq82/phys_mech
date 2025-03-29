import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateMechanismModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MechanismFormData) => Promise<void>;
  categories: { id: string; name: string }[];
}

interface MechanismFormData {
  title: string;
  description: string;
  categories: string[];
  file?: File;
  thumbnail?: File;
  file_url?: string;
  thumbnail_url?: string;
  duration: number;
  is_published: boolean;
}

const CreateMechanismModal: React.FC<CreateMechanismModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories
}) => {
  const [formData, setFormData] = useState<MechanismFormData>({
    title: '',
    description: '',
    categories: [],
    duration: 0,
    is_published: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isImageFile = (file: File) => {
    return file.type.startsWith('image/');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      try {
        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error('ファイルのアップロードに失敗しました');
        }
        
        const { url, duration } = await response.json();
        
        // メカニズムファイルが画像の場合、サムネイルとしても設定
        if (name === 'file' && isImageFile(file)) {
          setFormData(prev => ({
            ...prev,
            [name]: file,
            [`${name}_url`]: url,
            duration,
            thumbnail: file,
            thumbnail_url: url
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            [name]: file,
            [`${name}_url`]: url,
            ...(name === 'file' ? { duration } : {})
          }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ファイルのアップロードに失敗しました');
      }
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title || !formData.description || formData.categories.length === 0 || !formData.file_url) {
      setError('必須項目を入力してください（タイトル、説明、カテゴリー、メカニズムファイル）');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">新規メカニズム投稿</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              タイトル
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              説明
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              カテゴリー
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    formData.categories.includes(category.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="新規カテゴリー"
                className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-1"
              />
              <button
                type="button"
                onClick={async () => {
                  if (newCategory.trim()) {
                    try {
                      setIsAddingCategory(true);
                      const response = await fetch('/api/categories', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ name: newCategory.trim() }),
                      });

                      if (!response.ok) {
                        throw new Error('カテゴリーの作成に失敗しました');
                      }

                      const newCategoryData = await response.json();
                      categories.push({ id: newCategoryData.id, name: newCategoryData.name });
                      handleCategoryChange(newCategoryData.id);
                      setNewCategory('');
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'カテゴリーの作成に失敗しました');
                    } finally {
                      setIsAddingCategory(false);
                    }
                  }
                }}
                disabled={isAddingCategory}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {isAddingCategory ? '追加中...' : '追加'}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="is_published">
              公開状態
            </label>
            <div className="flex items-center">
              <input
                id="is_published"
                name="is_published"
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  is_published: e.target.checked
                }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
                公開する
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
              メカニズムファイル
            </label>
            <input
              id="file"
              name="file"
              type="file"
              onChange={handleFileChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg,.gif"
            />
            <p className="text-sm text-gray-500 mt-1">
              ※画像ファイルの場合、自動的にサムネイルとして設定されます
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="thumbnail">
              サムネイル画像（任意）
            </label>
            <input
              id="thumbnail"
              name="thumbnail"
              type="file"
              onChange={handleFileChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              accept="image/*"
            />
          </div>

          {error && (
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? '投稿中...' : '投稿'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMechanismModal;
