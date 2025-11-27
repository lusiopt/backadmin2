/**
 * Hook useUpdateService
 *
 * Atualiza dados de um serviço
 * Usa React Query mutation para otimismo e revalidação
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/services/auth';
import { adaptService } from '@/lib/adapters/apiAdapter';
import { Service } from '@/lib/types';
import toast from 'react-hot-toast';

// =====================================================
// TYPES
// =====================================================

export interface UpdateServiceData {
  processNumber?: string;
  processPassword?: string;
  entity?: string;
  reference?: string;
  status?: string;
  isPaidTax?: boolean;
  paidTaxAt?: string | null;
  isPaidGovernment?: boolean;
  paidGovernmentAt?: string | null;
  assignedAt?: string | null;
}

// =====================================================
// HOOK
// =====================================================

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceId,
      data,
    }: {
      serviceId: string;
      data: UpdateServiceData;
    }): Promise<Service> => {
      console.log('Enviando atualização:', { serviceId, data });

      // Fazer requisição
      const response = await apiClient.put(`/operator/services/${serviceId}`, data);

      console.log('Resposta da API:', response.data);

      // Adaptar resposta da API para o schema local
      const adapted = adaptService(response.data.service);
      console.log('Dados adaptados:', adapted);

      return adapted;
    },

    onSuccess: async (updatedService, variables) => {
      console.log('Mutation bem-sucedida, atualizando cache...');
      console.log('Serviço atualizado:', updatedService);

      toast.success('Atualizado com sucesso!');

      // Atualizar cache do serviço específico diretamente (sem refetch)
      queryClient.setQueryData(['service', variables.serviceId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          service: updatedService,
        };
      });

      // Atualizar o serviço na lista (sem refetch de toda a lista)
      queryClient.setQueriesData({ queryKey: ['services'] }, (old: any) => {
        if (!old?.services) return old;
        return {
          ...old,
          services: old.services.map((s: Service) =>
            s.id === variables.serviceId ? { ...s, ...updatedService } : s
          ),
        };
      });

      console.log('Cache atualizado otimisticamente (sem refetch)');
    },

    onError: (error: any) => {
      console.error('Erro ao atualizar serviço:', error);
      console.error('Detalhes:', error.response?.data);

      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      const statusCode = error.response?.status;

      toast.error(`Erro ao atualizar (${statusCode}): ${errorMessage}`, {
        duration: 6000,
      });
    },
  });
}
