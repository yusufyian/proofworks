import apiClient from './client';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  specification: string;
  manufacturer: {
    name: string;
    creditCode: string;
    license: string;
    address: string;
  };
  origin: {
    province: string;
    city: string;
    district: string;
    gps: [number, number];
    certifications: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  brand: string;
  category: string;
  specification: string;
  manufacturer: {
    name: string;
    creditCode: string;
    license: string;
    address: string;
  };
  origin: {
    province: string;
    city: string;
    district: string;
    gps: [number, number];
    certifications: string[];
  };
}

export const productApi = {
  getProducts: (params?: { category?: string; brand?: string; search?: string }) => {
    return apiClient.get<{ success: boolean; data: Product[]; total: number }>('/products', { params });
  },
  
  getProduct: (id: string) => {
    return apiClient.get<{ success: boolean; data: Product }>(`/products/${id}`);
  },
  
  createProduct: (data: CreateProductData) => {
    return apiClient.post<{ success: boolean; data: Product }>('/products', data);
  },
};

