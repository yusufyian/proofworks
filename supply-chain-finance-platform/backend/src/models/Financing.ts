import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database';

export interface FinancingAttributes {
  id: string;
  certificateId: string;
  applicantId: string; // 申请人（供应商）
  financierId: string; // 融资方（银行）
  amount: number;
  interestRate: number;
  term: number; // 期限（天）
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaid' | 'overdue';
  riskScore?: number;
  riskRating?: string;
  approvalDate?: Date;
  disbursementDate?: Date;
  repaymentDate?: Date;
  paymentTxHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FinancingCreationAttributes extends Optional<FinancingAttributes, 'id' | 'status' | 'riskScore' | 'riskRating' | 'approvalDate' | 'disbursementDate' | 'repaymentDate' | 'paymentTxHash' | 'createdAt' | 'updatedAt'> {}

export class Financing extends Model<FinancingAttributes, FinancingCreationAttributes> implements FinancingAttributes {
  public id!: string;
  public certificateId!: string;
  public applicantId!: string;
  public financierId!: string;
  public amount!: number;
  public interestRate!: number;
  public term!: number;
  public status!: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaid' | 'overdue';
  public riskScore?: number;
  public riskRating?: string;
  public approvalDate?: Date;
  public disbursementDate?: Date;
  public repaymentDate?: Date;
  public paymentTxHash?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Financing.init(
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
    applicantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    financierId: {
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
    interestRate: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    term: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'disbursed', 'repaid', 'overdue'),
      defaultValue: 'pending'
    },
    riskScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    riskRating: {
      type: DataTypes.STRING,
      allowNull: true
    },
    approvalDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    disbursementDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    repaymentDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    paymentTxHash: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'financings',
    timestamps: true
  }
);

