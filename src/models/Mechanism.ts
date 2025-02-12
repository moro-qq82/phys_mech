import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

interface MechanismAttributes {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MechanismCreationAttributes extends Omit<MechanismAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Mechanism extends Model<MechanismAttributes, MechanismCreationAttributes> implements MechanismAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public imageUrl!: string | undefined;
  public userId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Mechanism.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Mechanism',
    tableName: 'mechanisms',
  }
);

export default Mechanism;
