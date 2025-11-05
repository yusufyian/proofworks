import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

export interface CompanyAttributes {
  id: string;
  name: string;
  unifiedSocialCreditCode: string;
  type: 'core_enterprise' | 'supplier' | 'bank' | 'guarantee';
  creditRating?: string;
  creditLimit?: number;
  usedCreditLimit?: number;
  address?: string;
  contactPerson?: string;
  contactPhone?: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt?: Date;
  updatedAt?: Date;
}

interface CompanyCreationAttributes extends Optional<CompanyAttributes, 'id' | 'status' | 'usedCreditLimit' | 'createdAt' | 'updatedAt'> {}

export class Company extends Model<CompanyAttributes, CompanyCreationAttributes> implements CompanyAttributes {
  public id!: string;
  public name!: string;
  public unifiedSocialCreditCode!: string;
  public type!: 'core_enterprise' | 'supplier' | 'bank' | 'guarantee';
  public creditRating?: string;
  public creditLimit?: number;
  public usedCreditLimit?: number;
  public address?: string;
  public contactPerson?: string;
  public contactPhone?: string;
  public status!: 'active' | 'inactive' | 'suspended';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Company.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    unifiedSocialCreditCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.ENUM('core_enterprise', 'supplier', 'bank', 'guarantee'),
      allowNull: false
    },
    creditRating: {
      type: DataTypes.STRING,
      allowNull: true
    },
    creditLimit: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: true,
      defaultValue: 0
    },
    usedCreditLimit: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: true,
      defaultValue: 0
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contactPhone: {
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
    tableName: 'companies',
    timestamps: true
  }
);

