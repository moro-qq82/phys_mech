import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface MechanismAttributes {
  id: string;
  user_id: string;
  title: string;
  description: string;
  file_url: string;
  thumbnail_url?: string;
  duration: number;
  reliability_level?: string;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

interface MechanismCreationAttributes extends Optional<MechanismAttributes, 'id' | 'thumbnail_url' | 'reliability_level' | 'created_at' | 'updated_at'> {}

class Mechanism extends Model<MechanismAttributes, MechanismCreationAttributes> implements MechanismAttributes {
  public id!: string;
  public user_id!: string;
  public title!: string;
  public description!: string;
  public file_url!: string;
  public thumbnail_url?: string;
  public duration!: number;
  public reliability_level?: string;
  public is_published!: boolean;
  public created_at!: Date;
  public updated_at!: Date;

  // アソシエーション
  public static associate() {
    const Category = require('./Category').default;
    Mechanism.belongsToMany(Category, {
      through: 'MechanismCategories',
      foreignKey: 'mechanism_id',
      otherKey: 'category_id'
    });
  }
}

Mechanism.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      ...(process.env.NODE_ENV !== 'test' && {
        references: {
          model: 'Users',
          key: 'id'
        }
      })
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'タイトルは必須です'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: '説明は必須です'
        }
      }
    },
    file_url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    thumbnail_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    reliability_level: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_published: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
    modelName: 'Mechanism',
    tableName: 'mechanisms',
  }
);

export default Mechanism;
