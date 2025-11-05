export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'warehouse' | 'logistics' | 'pharmacy' | 'regulator';
  companyId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  type: 'producer' | 'wholesaler' | 'logistics' | 'hospital' | 'pharmacy' | 'regulator';
  address: string;
  contact: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: string;
  deviceId: string;
  name: string;
  type: 'warehouse' | 'vehicle' | 'portable';
  location?: string;
  vehicleId?: string;
  status: 'online' | 'offline' | 'maintenance';
  calibrationDate: string;
  nextCalibrationDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  batchNo: string;
  productName: string;
  productType: 'vaccine_cold' | 'vaccine_frozen' | 'biologic' | 'insulin' | 'cold_drug' | 'cool_drug';
  producerId: string;
  productionDate: string;
  expiryDate: string;
  quantity: number;
  unit: string;
  temperatureRange: {
    min: number;
    max: number;
  };
  traceCode?: string;
  status: 'in_storage' | 'in_transit' | 'delivered' | 'isolated' | 'destroyed';
  currentLocation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemperatureData {
  id: string;
  deviceId: string;
  batchId?: string;
  temperature: number;
  humidity: number;
  location?: {
    lat: number;
    lng: number;
  };
  vibration?: number;
  doorStatus?: 'open' | 'closed';
  timestamp: string;
  signature?: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  batchId?: string;
  deviceId: string;
  type: 'temperature' | 'humidity' | 'door' | 'device_offline' | 'vibration';
  level: 'warning' | 'serious' | 'critical';
  message: string;
  temperature?: number;
  threshold?: number;
  duration: number;
  status: 'pending' | 'acknowledged' | 'resolved' | 'false_alarm';
  handlerId?: string;
  handledAt?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transport {
  id: string;
  transportNo: string;
  batchIds: string[];
  fromCompanyId: string;
  toCompanyId: string;
  vehicleId?: string;
  driverName?: string;
  driverPhone?: string;
  startTime: string;
  endTime?: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'rejected' | 'cancelled';
  route?: {
    start: { lat: number; lng: number; name: string };
    end: { lat: number; lng: number; name: string };
    waypoints?: Array<{ lat: number; lng: number; name: string }>;
  };
  complianceScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  id: string;
  batchId: string;
  transportId?: string;
  type: 'temperature_exceeded' | 'device_failure' | 'prolonged_exposure' | 'other';
  severity: 'mild' | 'moderate' | 'severe';
  description: string;
  temperatureData?: {
    min: number;
    max: number;
    duration: number;
  };
  action: 'recheck' | 'isolate' | 'destroy' | 'continue';
  result?: string;
  inspectorId?: string;
  inspectedAt?: string;
  createdAt: string;
  updatedAt: string;
}
