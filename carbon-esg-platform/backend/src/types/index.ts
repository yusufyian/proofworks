export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'enterprise' | 'verifier' | 'supplier' | 'regulator';
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  unifiedSocialCreditCode: string;
  industry: string;
  region: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmissionFactor {
  id: string;
  name: string;
  category: 'energy' | 'transport' | 'material' | 'waste';
  unit: string;
  factor: number;
  source: string;
  version: string;
  year: number;
  region?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityData {
  id: string;
  companyId: string;
  emissionSourceId: string;
  emissionSourceName: string;
  scope: 'scope1' | 'scope2' | 'scope3';
  activityType: string;
  activityData: number;
  unit: string;
  period: string; // YYYY-MM
  dataSource: 'manual' | 'iot' | 'system';
  createdAt: string;
  updatedAt: string;
}

export interface CarbonInventory {
  id: string;
  companyId: string;
  period: string; // YYYY-MM
  scope1Emissions: number; // tCO2e
  scope2Emissions: number;
  scope3Emissions: number;
  totalEmissions: number;
  status: 'draft' | 'submitted' | 'verified' | 'certified';
  verifiedBy?: string;
  verifiedAt?: string;
  certificationNumber?: string;
  blockchainHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCarbonFootprint {
  id: string;
  productId: string;
  productName: string;
  companyId: string;
  functionalUnit: string;
  lcaResult: number; // kgCO2e per functional unit
  stages: {
    rawMaterial: number;
    manufacturing: number;
    transportation: number;
    use: number;
    disposal: number;
  };
  carbonLabel?: 'A' | 'B' | 'C';
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  blockchainHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReductionProject {
  id: string;
  companyId: string;
  projectName: string;
  projectType: 'renewable_energy' | 'energy_efficiency' | 'forestry' | 'other';
  baselineEmissions: number; // tCO2e/year
  actualEmissions: number;
  reductionAmount: number; // tCO2e/year
  vintage: string; // YYYY
  methodology: string;
  status: 'planning' | 'monitoring' | 'verification' | 'certified' | 'trading';
  verifiedBy?: string;
  verifiedAt?: string;
  certificationNumber?: string;
  blockchainTokenId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ESGReport {
  id: string;
  companyId: string;
  year: number;
  standard: 'GRI' | 'TCFD' | 'ISSB' | 'SASB';
  environmentalMetrics: {
    ghgScope1: number;
    ghgScope2: number;
    ghgScope3: number;
    waterConsumption: number;
    wasteGeneration: number;
    renewableEnergyRate: number;
  };
  socialMetrics: {
    totalEmployees: number;
    newHires: number;
    turnover: number;
    trainingHours: number;
    accidents: number;
  };
  governanceMetrics: {
    boardIndependence: number;
    antiCorruptionCases: number;
    ethicsTraining: number;
  };
  status: 'draft' | 'published';
  publishedAt?: string;
  blockchainHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Verification {
  id: string;
  resourceType: 'inventory' | 'product' | 'reduction_project';
  resourceId: string;
  verifierId: string;
  verifierName: string;
  status: 'pending' | 'approved' | 'rejected';
  report: string;
  standard: string;
  verifiedAt?: string;
  blockchainHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierCarbonData {
  id: string;
  supplierId: string;
  buyerId: string;
  productId?: string;
  carbonFootprint: number; // kgCO2e per unit or total
  unit: string;
  period: string;
  verified: boolean;
  verificationReport?: string;
  rating?: 'A+' | 'A' | 'B' | 'C' | 'D';
  createdAt: string;
  updatedAt: string;
}

