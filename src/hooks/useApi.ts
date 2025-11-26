// Hook customizado para usar a API com React Query
// Facilita o gerenciamento de estado e cache

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import apiService from '@/lib/api';
import { ServiceWithRelations, User } from '@/lib/types';

// =====================================================
// HOOKS PARA SERVIÇOS
// =====================================================

export function useServices(filters?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['services', filters],
    queryFn: () => apiService.getServices(filters),
    staleTime: 30000, // 30 segundos
    retry: 3,
  });
}

export function useService(id: string, options?: UseQueryOptions<ServiceWithRelations>) {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => apiService.getServiceById(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiService.createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useUpdateServiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, step, data }: { id: string; step: number; data: any }) =>
      apiService.updateServiceStatus(id, step, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useCancelService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiService.cancelService,
    onSuccess: (_, serviceId) => {
      queryClient.invalidateQueries({ queryKey: ['service', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

// =====================================================
// HOOKS PARA DOCUMENTOS
// =====================================================

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, file }: { serviceId: string; file: File }) =>
      apiService.uploadDocument(serviceId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service', variables.serviceId] });
      queryClient.invalidateQueries({ queryKey: ['documents', variables.serviceId] });
    },
  });
}

export function useServiceDocuments(serviceId: string) {
  return useQuery({
    queryKey: ['documents', serviceId],
    queryFn: () => apiService.getServiceDocuments(serviceId),
    enabled: !!serviceId,
  });
}

// =====================================================
// HOOKS PARA USUÁRIOS
// =====================================================

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: apiService.getUsers,
    staleTime: 60000, // 1 minuto
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => apiService.getUserById(id),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      apiService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

// =====================================================
// HOOKS PARA DASHBOARD
// =====================================================

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: apiService.getDashboardStats,
    staleTime: 60000, // 1 minuto
    refetchInterval: 300000, // 5 minutos
  });
}

// =====================================================
// HOOKS PARA AÇÕES DO ADVOGADO
// =====================================================

export function useApproveService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceId,
      data
    }: {
      serviceId: string;
      data: {
        processNumber: string;
        entity: string;
        reference: string;
      }
    }) => apiService.approveService(serviceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service', variables.serviceId] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useRefuseService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceId,
      justification
    }: {
      serviceId: string;
      justification: string;
    }) => apiService.refuseService(serviceId, justification),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service', variables.serviceId] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useAlmostApproveService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceId,
      justification
    }: {
      serviceId: string;
      justification: string;
    }) => apiService.almostApproveService(serviceId, justification),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['service', variables.serviceId] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

// =====================================================
// HOOKS PARA AUTENTICAÇÃO
// =====================================================

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiService.login(email, password),
    onSuccess: (data) => {
      // Limpar todo o cache após login
      queryClient.clear();
      // Salvar dados do usuário
      queryClient.setQueryData(['current-user'], data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: apiService.logout,
    onSuccess: () => {
      // Limpar todo o cache após logout
      queryClient.clear();
      window.location.href = '/login';
    },
  });
}