import { User } from './User';
import { Company } from './Company';
import { Certificate } from './Certificate';
import { Transfer } from './Transfer';
import { Financing } from './Financing';
import { AuditLog } from './AuditLog';

// User - Company 关联
User.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
Company.hasMany(User, { foreignKey: 'companyId', as: 'users' });

// Certificate - Company 关联
Certificate.belongsTo(Company, { foreignKey: 'creditorId', as: 'creditor' });
Certificate.belongsTo(Company, { foreignKey: 'debtorId', as: 'debtor' });
Certificate.belongsTo(Certificate, { foreignKey: 'originalCertificateId', as: 'originalCertificate' });

// Transfer - Certificate 关联
Transfer.belongsTo(Certificate, { foreignKey: 'certificateId', as: 'certificate' });
Transfer.belongsTo(Company, { foreignKey: 'fromCompanyId', as: 'fromCompany' });
Transfer.belongsTo(Company, { foreignKey: 'toCompanyId', as: 'toCompany' });

// Financing - Certificate 关联
Financing.belongsTo(Certificate, { foreignKey: 'certificateId', as: 'certificate' });
Financing.belongsTo(Company, { foreignKey: 'applicantId', as: 'applicant' });
Financing.belongsTo(Company, { foreignKey: 'financierId', as: 'financier' });

// AuditLog - User 关联
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
AuditLog.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

export {
  User,
  Company,
  Certificate,
  Transfer,
  Financing,
  AuditLog
};

