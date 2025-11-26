/**
 * Hook useServices
 *
 * Lista serviços com paginação e filtros
 * Usa React Query para cache e revalidação
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/services/auth';
import { adaptServiceListResponse } from '@/lib/adapters/apiAdapter';
import { Service } from '@/lib/types';

// =====================================================
// TYPES
// =====================================================

export interface UseServicesParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  userId?: string;
}

export interface UseServicesResponse {
  services: Service[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// =====================================================
// HOOK
// =====================================================

export function useServices(params: UseServicesParams = {}) {
  const {
    page = 1,
    limit = 20,
    status,
    search,
    userId,
  } = params;

  return useQuery({
    queryKey: ['services', { page, limit, status, search, userId }],

    queryFn: async (): Promise<UseServicesResponse> => {
      // Construir query params
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) queryParams.append('status', status);
      if (search) queryParams.append('search', search);
      if (userId) queryParams.append('userId', userId);

      // Fazer requisição
      const response = await apiClient.get(`/operator/services?${queryParams.toString()}`);

      // Adaptar resposta da API para o schema local
      return adaptServiceListResponse(response.data);
    },

    // Cache por 5 minutos
    staleTime: 5 * 60 * 1000,

    // Desabilitado: evita requisições desnecessárias ao trocar de aba
    refetchOnWindowFocus: false,

    // Retry automático em caso de erro
    retry: 2,
  });
}
