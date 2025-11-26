/**
 * Hook useLogout
 *
 * Gerencia o processo de logout do operador
 */

import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/lib/services/auth';

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    // Limpar autenticação
    authService.logout();

    // Limpar cache do React Query
    queryClient.clear();

    // Redirecionar para login
    router.push('/login');
  };
}
