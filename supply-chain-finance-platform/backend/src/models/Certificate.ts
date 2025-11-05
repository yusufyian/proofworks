import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

export interface CertificateAttributes {
  id: string;
  certificateNumber: string;
  originalCertificateId?: string;
  creditorId: string; // 核心企业ID
  debtorId: string; // 当前持有人ID
  initialAmount: number;
  remainingAmount: number;
  issueDate: Date;
  expiryDate: Date;
  status: 'holding' | 'transferred' | 'pledged' | 'redeemed' | 'split';
  contractHash?: string;
  invoiceHash?: string;
  receiptHash?: string;
  signature?: string;
  blockchainTxHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CertificateCreationAttributes extends Optional<CertificateAttributes, 'id' | 'originalCertificateId' | 'status' | 'contractHash' | 'invoiceHash' | 'receiptHash' | 'signature' | 'blockchainTxHash' | 'createdAt' | 'updatedAt'> {}

export class Certificate extends Model<CertificateAttributes, CertificateCreationAttributes> implements CertificateAttributes {
  public id!: string;
  public certificateNumber!: string;
  public originalCertificateId?: string;
  public creditorId!: string;
  public debtorId!: string;
  public initialAmount!: number;
  public remainingAmount!: number;
  public issueDate!: Date;
  public expiryDate!: Date;
  public status!: 'holding' | 'transferred' | 'pledged' | 'redeemed' | 'split';
  public contractHash?: string;
  public invoiceHash?: string;
  public receiptHash?: string;
  public signature?: string;
  public blockchainTxHash?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Certificate.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    certificateNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    originalCertificateId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'certificates',
        key: 'id'
      }
    },
    creditorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    debtorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    initialAmount: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false
    },
    remainingAmount: {
      type: DataTypes.DECIMAL(20, 2),
      allowNull: false
    },
    issueDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('holding', 'transferred', 'pledged', 'redeemed', 'split'),
      defaultValue: 'holding'
    },
    contractHash: {
      type: DataTypes.STRING,
      allowNull: true
    },
    invoiceHash: {
      type: DataTypes.STRING,
      allowNull: true
    },
    receiptHash: {
      type: DataTypes.STRING,
      allowNull: true
    },
    signature: {
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
    tableName: 'certificates',
    timestamps: true
  }
);

