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
      console.log('🔄 Enviando atualização:', { serviceId, data });

      // Fazer requisição
      const response = await apiClient.put(`/operator/services/${serviceId}`, data);

      console.log('✅ Resposta da API:', response.data);

      // Adaptar resposta da API para o schema local
      const adapted = adaptService(response.data.service);
      console.log('🔄 Dados adaptados:', adapted);

      return adapted;
    },

    onSuccess: async (updatedService, variables) => {
      console.log('✅ Mutation bem-sucedida, invalidando cache...');
      console.log('Serviço atualizado:', updatedService);

      toast.success('✅ Atualizado com sucesso!');

      // Invalidar e refetch cache da lista de serviços
      await queryClient.invalidateQueries({
        queryKey: ['services'],
        refetchType: 'active'
      });

      // Invalidar e refetch cache do serviço específico
      await queryClient.invalidateQueries({
        queryKey: ['service', variables.serviceId],
        refetchType: 'active'
      });

      console.log('✅ Cache invalidado e refetch acionado...');
    },

    onError: (error: any) => {
      console.error('❌ Erro ao atualizar serviço:', error);
      console.error('Detalhes:', error.response?.data);

      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      const statusCode = error.response?.status;

      toast.error(`❌ Erro ao atualizar (${statusCode}): ${errorMessage}`, {
        duration: 6000,
      });
    },
  });
}
