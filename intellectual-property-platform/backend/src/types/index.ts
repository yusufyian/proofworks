export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  role: 'creator' | 'lawyer' | 'judge' | 'admin';
  organization?: string;
  phone?: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  certificateId: string;
  assetType: string;
  fileName: string;
  fileHash: string;
  fileSize: number;
  author: {
    name: string;
    idCard?: string;
    ca_cert?: string;
  };
  timestamp: {
    tsa: string;
    time: string;
    tsa_signature: string;
  };
  blockchain: {
    chain: string;
    txHash: string;
    blockHeight: number;
    node: string;
  };
  metadata: {
    description: string;
    tags: string[];
    license: string;
  };
  qrcode?: string;
  ownerId: string;
  status: 'registered' | 'licensed' | 'transferred' | 'expired';
  createdAt: string;
}

export interface InfringementCase {
  id: string;
  assetId: string;
  asset: Asset;
  suspectUrl: string;
  suspectPlatform: string;
  similarity: number;
  evidence: {
    screenshots: string[];
    sourceCode: string;
    productInfo: {
      seller: string;
      sales: number;
      price: number;
    };
  };
  blockchain: {
    evidenceHash: string;
    txHash: string;
    blockHeight: number;
  };
  status: 'monitoring' | 'pending' | 'investigating' | 'settled' | 'litigation' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface RightsProtection {
  id: string;
  caseId: string;
  infringementCase: InfringementCase;
  applicantId: string;
  lawyerId?: string;
  evidence: {
    originalCertificate: string;
    infringementEvidence: string;
    economicLoss: number;
  };
  notary?: {
    certificateNumber: string;
    issueDate: string;
    organization: string;
  };
  status: 'submitted' | 'lawyer_reviewing' | 'notary_applied' | 'letter_sent' | 'negotiating' | 'litigation' | 'settled' | 'closed';
  lawyerLetter?: string;
  settlement?: {
    amount: number;
    agreement: string;
    txHash: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface License {
  id: string;
  assetId: string;
  asset: Asset;
  licensorId: string;
  licenseeId: string;
  licenseType: 'non_exclusive' | 'exclusive' | 'sole' | 'regional' | 'temporal';
  price: number;
  duration: number;
  scope: string;
  nftTokenId?: string;
  status: 'listed' | 'active' | 'expired' | 'revoked';
  blockchain: {
    txHash: string;
    blockHeight: number;
  };
  createdAt: string;
  expiresAt: string;
}

export interface Device {
  id: string;
  tokenId: string;
  assetType: string;
  name: string;
  serialNumber: string;
  manufacturer: string;
  purchaseDate: string;
  originalValue: number;
  location: string;
  status: 'normal' | 'maintenance' | 'transferred' | 'scrapped';
  owner: string;
  metadata: {
    model: string;
    weight?: string;
    power?: string;
    warranty?: string;
  };
  iot_deviceId?: string;
  images: string[];
  documents: string[];
  createdAt: string;
  updatedAt: string;
}

