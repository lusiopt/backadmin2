/**
 * Hook useService
 *
 * Busca detalhes de um serviço específico
 * Usa React Query para cache e revalidação
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/services/auth';
import { adaptServiceDetailResponse } from '@/lib/adapters/apiAdapter';
import { Service } from '@/lib/types';

// =====================================================
// TYPES
// =====================================================

export interface UseServiceResponse {
  service: Service;
  summary: {
    totalDocuments: number;
    totalAttorneyDocuments: number;
    totalProblems: number;
    approvedDocuments: number;
    pendingDocuments: number;
  };
}

// =====================================================
// HOOK
// =====================================================

export function useService(serviceId: string | undefined) {
  return useQuery({
    queryKey: ['service', serviceId],

    queryFn: async (): Promise<UseServiceResponse> => {
      if (!serviceId) {
        throw new Error('Service ID is required');
      }

      // Fazer requisição
      const response = await apiClient.get(`/operator/services/${serviceId}`);

      // Adaptar resposta da API para o schema local
      return adaptServiceDetailResponse(response.data);
    },

    // Só executar query se serviceId estiver definido
    enabled: !!serviceId,

    // Cache por 5 minutos
    staleTime: 5 * 60 * 1000,

    // Desabilitado: evita requisições desnecessárias ao trocar de aba
    refetchOnWindowFocus: false,

    // Retry automático em caso de erro
    retry: 2,
  });
}
