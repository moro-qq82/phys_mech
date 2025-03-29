import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Mechanism from './Mechanism';

interface CategoryAttributes {
  id: string;
  name: string;
  description?: string;
  created_by?: string;
  is_system: boolean;
  created_at: Date;
  updated_at: Date;
}

interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'description' | 'created_by' | 'created_at' | 'updated_at'> {}

export class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  public id!: string;
  public name!: string;
  public description!: string;
  public created_by!: string;
  public is_system!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // アソシエーション
  public static associate() {
    Category.belongsToMany(Mechanism, {
      through: 'MechanismCategories',
      foreignKey: 'category_id',
      otherKey: 'mechanism_id'
    });
  }
}

Category.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: true
    },
    is_system: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'Categories',
    timestamps: true,
    underscored: true
  }
);

export default Category;
