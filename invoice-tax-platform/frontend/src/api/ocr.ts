import apiClient from './client';

export const ocrApi = {
  recognize: (data: { imageData: string }) => apiClient.post('/api/ocr/recognize', data),
};

