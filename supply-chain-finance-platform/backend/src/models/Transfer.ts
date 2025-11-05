import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

export interface TransferAttributes {
  id: string;
  certificateId: string;
  fromCompanyId: string;
  toCompanyId: string;
  amount: number;
  transferType: 'full' | 'split';
  status: 'pending' | 'completed' | 'rejected' | 'cancelled';
  reason?: string;
  blockchainTxHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TransferCreationAttributes extends Optional<TransferAttributes, 'id' | 'status' | 'reason' | 'blockchainTxHash' | 'createdAt' | 'updatedAt'> {}

export class Transfer extends Model<TransferAttributes, TransferCreationAttributes> implements TransferAttributes {
  public id!: string;
  public certificateId!: string;
  public fromCompanyId!: string;
  public toCompanyId!: string;
  public amount!: number;
  public transferType!: 'full' | 'split';
  public status!: 'pending' | 'completed' | 'rejected' | 'cancelled';
  public reason?: string;
  public blockchainTxHash?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Transfer.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    certificateId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'certificates',
        key: 'id'
      }
    },
    fromCompanyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    toCompanyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false
    },
    transferType: {
      type: DataTypes.ENUM('full', 'split'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'rejected', 'cancelled'),
      defaultValue: 'pending'
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    blockchainTxHash: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'transfers',
    timestamps: true
  }
);

