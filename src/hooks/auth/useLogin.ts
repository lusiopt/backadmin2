/**
 * Hook useLogin
 *
 * Gerencia o processo de login do operador
 * Usa React Query mutation para estado otimizado
 */

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService, LoginCredentials, LoginResponse } from '@/lib/services/auth';

interface UseLoginOptions {
  redirectUrl?: string;
}

export function useLogin(options?: UseLoginOptions) {
  const router = useRouter();
  const redirectUrl = options?.redirectUrl || '/';

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),

    onSuccess: (data: LoginResponse) => {
      // Redirecionar para URL especificada ou dashboard
      router.push(redirectUrl);
    },

    onError: (error: any) => {
      console.error('Erro no login:', error);
    },
  });
}
