import Mechanism from '../../models/Mechanism';
import { Op } from 'sequelize';

describe('Mechanism Model', () => {
  const validMechanismData = {
    title: 'テスト機構',
    description: 'これはテスト用の機構です。',
    user_id: '123e4567-e89b-12d3-a456-426614174000', // UUIDフォーマットに変更
    file_url: 'https://example.com/mechanism.glb',
    duration: 30,
    is_published: false,
  };

  describe('作成', () => {
    it('有効なデータで機構を作成できる', async () => {
      const mechanism = await Mechanism.create(validMechanismData);
      
      expect(mechanism.id).toBeDefined();
      expect(mechanism.title).toBe(validMechanismData.title);
      expect(mechanism.description).toBe(validMechanismData.description);
      expect(mechanism.user_id).toBe(validMechanismData.user_id);
      expect(mechanism.created_at).toBeDefined();
      expect(mechanism.updated_at).toBeDefined();
    });

    it('タイトルが空の場合はエラーになる', async () => {
      const invalidData = { ...validMechanismData, title: '' };
      
      await expect(Mechanism.create(invalidData))
        .rejects
        .toThrow();
    });

    it('説明が空の場合はエラーになる', async () => {
      const invalidData = { ...validMechanismData, description: '' };
      
      await expect(Mechanism.create(invalidData))
        .rejects
        .toThrow();
    });
  });

  describe('取得', () => {
    it('IDで機構を取得できる', async () => {
      const created = await Mechanism.create(validMechanismData);
      const found = await Mechanism.findByPk(created.id);
      
      expect(found).not.toBeNull();
      expect(found?.title).toBe(validMechanismData.title);
    });

    it('存在しないIDの場合はnullを返す', async () => {
      const found = await Mechanism.findByPk('00000000-0000-0000-0000-000000000000');
      expect(found).toBeNull();
    });
  });

  describe('更新', () => {
    it('機構の情報を更新できる', async () => {
      const mechanism = await Mechanism.create(validMechanismData);
      const newTitle = '更新された機構';
      
      await mechanism.update({ title: newTitle });
      
      const updated = await Mechanism.findByPk(mechanism.id);
      expect(updated?.title).toBe(newTitle);
    });
  });

  describe('削除', () => {
    it('機構を削除できる', async () => {
      const mechanism = await Mechanism.create(validMechanismData);
      await mechanism.destroy();
      
      const found = await Mechanism.findByPk(mechanism.id);
      expect(found).toBeNull();
    });
  });

  describe('検索', () => {
    beforeEach(async () => {
      await Mechanism.bulkCreate([
        { ...validMechanismData, title: '歯車機構A' },
        { ...validMechanismData, title: '歯車機構B' },
        { ...validMechanismData, title: 'リンク機構' },
      ]);
    });

    it('タイトルで検索できる', async () => {
      const results = await Mechanism.findAll({
        where: {
          title: {
            [Op.like]: '%歯車%'
          }
        }
      });

      expect(results.length).toBe(2);
      expect(results.every(m => m.title.includes('歯車'))).toBe(true);
    });
  });
});
