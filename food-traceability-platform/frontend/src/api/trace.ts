import apiClient from './client';
import { Product } from './products';
import { Batch } from './batches';

export interface TransferEvent {
  id: string;
  traceCode: string;
  batchId: string;
  eventType: string;
  timestamp: string;
  operator: {
    name: string;
    company: string;
    role: string;
  };
  location: {
    name: string;
    gps: [number, number];
  };
  content: Record<string, any>;
  attachments: string[];
  signature: string;
  blockHeight?: number;
  txHash?: string;
}

export interface IoTData {
  id: string;
  traceCode: string;
  batchId: string;
  sensorType: string;
  value: number | [number, number];
  timestamp: string;
  deviceId: string;
  location?: {
    name: string;
    gps: [number, number];
  };
}

export interface TraceResult {
  product: Product;
  batch: Batch;
  events: TransferEvent[];
  iotData: IoTData[];
  recall?: any;
}

export const traceApi = {
  traceByCode: (traceCode: string) => {
    return apiClient.get<{ success: boolean; data: TraceResult }>(`/trace/code/${traceCode}`);
  },
  
  traceByBatch: (batchId: string) => {
    return apiClient.get<{ success: boolean; data: TraceResult }>(`/trace/batch/${batchId}`);
  },
  
  getSampleCodes: () => {
    return apiClient.get<{ success: boolean; data: { sampleCodes: string[]; total: number } }>('/trace/samples');
  },
};

