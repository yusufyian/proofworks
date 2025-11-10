import apiClient from './client';

export interface OverviewData {
  kpis: {
    totalProducts: number;
    totalBatches: number;
    totalEvents: number;
    totalRecalls: number;
    traceabilityCoverage: number;
    complianceRate: number;
    recallRate: number;
    tempComplianceRate: number;
  };
  trends: Array<{
    date: string;
    batches: number;
    events: number;
  }>;
}

export interface TrendData {
  date: string;
  value: number;
}

export interface QualityAnalysis {
  statusStats: Record<string, number>;
  categoryStats: Record<string, number>;
  qualityIssues: Record<string, number>;
  testResults: Record<string, number>;
  totalBatches: number;
  qualifiedBatches: number;
}

export interface LogisticsAnalysis {
  avgStayTimes: Record<string, number>;
  locationStats: Record<string, number>;
  operatorStats: Record<string, number>;
  totalLogisticsEvents: number;
}

export interface TemperatureAnalysis {
  tempRanges: Record<string, number>;
  tempTrend: Array<{
    date: string;
    avg: number;
    min: number;
    max: number;
    count: number;
  }>;
  abnormalEvents: number;
  complianceRate: number;
  totalDataPoints: number;
}

export interface HeatmapData {
  name: string;
  count: number;
  gps: [number, number];
}

export const analyticsApi = {
  getOverview: (params?: { startDate?: string; endDate?: string }) => {
    return apiClient.get<{ success: boolean; data: OverviewData }>('/analytics/overview', { params });
  },
  
  getTrends: (params?: { metric?: string; startDate?: string; endDate?: string; granularity?: string }) => {
    return apiClient.get<{ success: boolean; data: TrendData[] }>('/analytics/trends', { params });
  },
  
  getQualityAnalysis: (params?: { startDate?: string; endDate?: string }) => {
    return apiClient.get<{ success: boolean; data: QualityAnalysis }>('/analytics/quality', { params });
  },
  
  getLogisticsAnalysis: (params?: { startDate?: string; endDate?: string }) => {
    return apiClient.get<{ success: boolean; data: LogisticsAnalysis }>('/analytics/logistics', { params });
  },
  
  getTemperatureAnalysis: (params?: { startDate?: string; endDate?: string }) => {
    return apiClient.get<{ success: boolean; data: TemperatureAnalysis }>('/analytics/temperature', { params });
  },
  
  getHeatmap: (params?: { dimension?: string; startDate?: string; endDate?: string }) => {
    return apiClient.get<{ success: boolean; data: HeatmapData[] }>('/analytics/heatmap', { params });
  },
};

