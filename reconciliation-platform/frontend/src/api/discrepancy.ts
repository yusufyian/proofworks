import api from './client';

export const discrepancyApi = {
  getTickets: (params?: any) => api.get('/discrepancy/tickets', { params }),
  getStats: () => api.get('/discrepancy/stats'),
  updateTicket: (id: string, updates: any) => api.patch(`/discrepancy/tickets/${id}`, updates),
};

