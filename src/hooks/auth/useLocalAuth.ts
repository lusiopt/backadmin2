/**
 * Hook useLocalAuth
 *
 * Gerencia autenticação local via PostgreSQL
 * Usa React Query mutation para estado otimizado
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { LocalUser } from '@/lib/services/auth-local';

// BasePath para API calls (Next.js não adiciona automaticamente em fetch)
const API_BASE = '/backadmin2';

interface LoginCredentials {
  login: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user?: LocalUser;
  error?: string;
}

interface UseLocalLoginOptions {
  redirectUrl?: string;
}

/**
 * Hook para fazer login local
 */
export function useLocalLogin(options?: UseLocalLoginOptions) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const redirectUrl = options?.redirectUrl || '/';

  return useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      return data;
    },

    onSuccess: (data) => {
      // Invalidar queries de usuário
      queryClient.invalidateQueries({ queryKey: ['localUser'] });

      // Redirecionar para URL especificada ou dashboard
      router.push(redirectUrl);
    },

    onError: (error: any) => {
      console.error('Erro no login:', error);
    },
  });
}

/**
 * Hook para fazer logout local
 */
export function useLocalLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer logout');
      }

      return response.json();
    },

    onSuccess: () => {
      // Limpar cache do usuário
      queryClient.setQueryData(['localUser'], null);
      queryClient.invalidateQueries({ queryKey: ['localUser'] });

      // Redirecionar para login
      router.push('/login');
    },
  });
}

/**
 * Hook para buscar usuário atual
 */
export function useLocalUser() {
  return useQuery({
    queryKey: ['localUser'],
    queryFn: async (): Promise<LocalUser | null> => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/me`);

        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        return data.user || null;
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false,
  });
}
