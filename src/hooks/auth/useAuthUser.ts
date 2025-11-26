/**
 * Hook useAuthUser
 *
 * Retorna os dados do usuário autenticado
 * Usa React Query para cache e sincronização
 */

import { useQuery } from '@tanstack/react-query';
import { authService, LoginResponse } from '@/lib/services/auth';

export function useAuthUser() {
  return useQuery({
    queryKey: ['authUser'],
    queryFn: () => {
      const user = authService.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      return user;
    },
    enabled: authService.isAuthenticated(), // Só busca se estiver autenticado
    staleTime: Infinity, // Dados do user não ficam "stale"
    retry: false, // Não tentar novamente se falhar
  });
}
