// API Service para conectar com o backend Lusio
// Configuração para substituir dados mock por API real

import axios, { AxiosInstance } from 'axios';
import { Service, ServiceWithRelations, User, Person } from './types';

// Configuração base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token JWT
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para tratar erros
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          this.token = null;
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // =====================================================
  // AUTENTICAÇÃO
  // =====================================================

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await this.api.post('/auth/login', { email, password });
    this.token = response.data.token;
    if (this.token) {
      localStorage.setItem('authToken', this.token);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // =====================================================
  // SERVIÇOS (PEDIDOS)
  // =====================================================

  async getServices(filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceWithRelations[]> {
    const response = await this.api.get('/service/', { params: filters });
    return response.data;
  }

  async getServiceById(id: string): Promise<ServiceWithRelations> {
    const response = await this.api.get(`/service/${id}`);
    return response.data;
  }

  async createService(data: Partial<Service>): Promise<Service> {
    const response = await this.api.post('/service/', data);
    return response.data;
  }

  async updateServiceStatus(id: string, step: number, data: any): Promise<Service> {
    const response = await this.api.put(`/service/${id}/step${step}`, data);
    return response.data;
  }

  async cancelService(id: string): Promise<void> {
    await this.api.put(`/service/${id}/cancel`);
  }

  // =====================================================
  // DOCUMENTOS
  // =====================================================

  async uploadDocument(serviceId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post(`/service/${serviceId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getServiceDocuments(serviceId: string): Promise<any[]> {
    const response = await this.api.get(`/service/${serviceId}/documents`);
    return response.data;
  }

  async getServicePDF(serviceId: string): Promise<Blob> {
    const response = await this.api.get(`/service/${serviceId}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // =====================================================
  // USUÁRIOS
  // =====================================================

  async getUsers(): Promise<User[]> {
    const response = await this.api.get('/user/');
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await this.api.get(`/user/${id}`);
    return response.data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await this.api.put(`/user/${id}`, data);
    return response.data;
  }

  // =====================================================
  // ESTATÍSTICAS (DASHBOARD)
  // =====================================================

  async getDashboardStats(): Promise<{
    totalServices: number;
    pendingServices: number;
    completedServices: number;
    recentActivity: any[];
  }> {
    // Este endpoint precisa ser criado no backend
    // Por enquanto, vamos calcular baseado nos serviços
    const services = await this.getServices();

    return {
      totalServices: services.length,
      pendingServices: services.filter(s =>
        s.status?.includes('STEP') && !s.status.includes('COMPLETED')
      ).length,
      completedServices: services.filter(s =>
        s.status === 'COMPLETED'
      ).length,
      recentActivity: services.slice(0, 5),
    };
  }

  // =====================================================
  // AÇÕES DO ADVOGADO
  // =====================================================

  async approveService(serviceId: string, data: {
    processNumber: string;
    entity: string;
    reference: string;
  }): Promise<Service> {
    const response = await this.api.put(`/service/${serviceId}/step7`, {
      ...data,
      action: 'approve',
    });
    return response.data;
  }

  async refuseService(serviceId: string, justification: string): Promise<Service> {
    const response = await this.api.put(`/service/${serviceId}/step7`, {
      action: 'refuse',
      refuseJustification: justification,
    });
    return response.data;
  }

  async almostApproveService(serviceId: string, justification: string): Promise<Service> {
    const response = await this.api.put(`/service/${serviceId}/step7`, {
      action: 'almost',
      almostJustification: justification,
    });
    return response.data;
  }
}

// Singleton instance
const apiService = new ApiService();

// Auto-load token from localStorage
if (typeof window !== 'undefined') {
  const savedToken = localStorage.getItem('authToken');
  if (savedToken) {
    apiService.setToken(savedToken);
  }
}

export default apiService;