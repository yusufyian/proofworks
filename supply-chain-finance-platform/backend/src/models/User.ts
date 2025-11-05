import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  companyId: string;
  role: 'core_enterprise' | 'supplier' | 'bank' | 'admin';
  name: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'status' | 'createdAt' | 'updatedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password!: string;
  public companyId!: string;
  public role!: 'core_enterprise' | 'supplier' | 'bank' | 'admin';
  public name!: string;
  public phone?: string;
  public status!: 'active' | 'inactive' | 'suspended';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('core_enterprise', 'supplier', 'bank', 'admin'),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true
  }
);

