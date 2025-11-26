/**
 * Serviço de Autenticação - Luzio API
 *
 * Gerencia login, logout e token JWT para operadores
 * Ambiente: STAGING apenas
 */

import axios from 'axios';
import Cookies from 'js-cookie';

// =====================================================
// CONFIGURAÇÃO
// =====================================================

const API_BASE_URL = 'https://api.lusio.staging.goldenclouddev.com.br';

// Criar instância do Axios com configuração base
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// =====================================================
// TYPES
// =====================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  operator: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface AuthError {
  message: string;
  code?: string;
}

// =====================================================
// STORAGE (Cookies - Seguro e compatível com Middleware)
// =====================================================

const TOKEN_KEY = 'lusio_operator_token';
const USER_KEY = 'lusio_operator_user';

// Configuração dos cookies
const COOKIE_OPTIONS = {
  expires: 1, // 1 dia (mesmo tempo do token JWT)
  secure: process.env.NODE_ENV === 'production', // HTTPS em produção
  sameSite: 'lax' as const, // Proteção CSRF
};

export const authStorage = {
  // Salvar token
  setToken(token: string): void {
    Cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
  },

  // Buscar token
  getToken(): string | null {
    return Cookies.get(TOKEN_KEY) || null;
  },

  // Remover token
  removeToken(): void {
    Cookies.remove(TOKEN_KEY);
  },

  // Salvar dados do usuário
  setUser(user: LoginResponse['operator']): void {
    Cookies.set(USER_KEY, JSON.stringify(user), COOKIE_OPTIONS);
  },

  // Buscar dados do usuário
  getUser(): LoginResponse['operator'] | null {
    const user = Cookies.get(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  // Remover dados do usuário
  removeUser(): void {
    Cookies.remove(USER_KEY);
  },

  // Limpar tudo
  clear(): void {
    this.removeToken();
    this.removeUser();
  },
};

// =====================================================
// INTERCEPTORS
// =====================================================

// Adicionar token automaticamente em todas as requisições
apiClient.interceptors.request.use(
  (config) => {
    const token = authStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Tratar erros de autenticação (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      console.warn('⚠️ Token inválido ou expirado. Fazendo logout...');
      authStorage.clear();

      // Mostrar mensagem ao usuário
      if (typeof window !== 'undefined') {
        // Usar toast se disponível
        if ((window as any).toast) {
          (window as any).toast.error('Sessão expirada. Faça login novamente.');
        }

        // Redirecionar para login
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// =====================================================
// SERVIÇO DE AUTENTICAÇÃO
// =====================================================

export const authService = {
  /**
   * Fazer login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/operator/login', credentials);

      // Salvar token e usuário
      authStorage.setToken(response.data.token);
      authStorage.setUser(response.data.operator);

      return response.data;
    } catch (error: any) {
      throw {
        message: error.response?.data?.message || 'Erro ao fazer login',
        code: error.response?.status,
      } as AuthError;
    }
  },

  /**
   * Fazer logout
   */
  logout(): void {
    authStorage.clear();
  },

  /**
   * Verificar se está autenticado
   */
  isAuthenticated(): boolean {
    return !!authStorage.getToken();
  },

  /**
   * Buscar usuário logado
   */
  getCurrentUser(): LoginResponse['operator'] | null {
    return authStorage.getUser();
  },

  /**
   * Buscar token atual
   */
  getToken(): string | null {
    return authStorage.getToken();
  },
};
