"use client";

/**
 * Componente de Proteção de Rotas
 *
 * Verifica se o usuário está autenticado e redireciona para login se necessário.
 * Mostra skeleton enquanto verifica autenticação para melhor UX.
 */

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/services/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = authService.isAuthenticated();

      if (!isAuthenticated) {
        // Salvar URL atual para redirect após login
        const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
        router.replace(loginUrl);
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  // Mostrar skeleton enquanto verifica autenticação
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lusioBlueLight via-white to-primaryLight p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
