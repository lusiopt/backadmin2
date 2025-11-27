import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyCredentials, generateToken } from '@/lib/services/auth-local';

// Credenciais da API Lusio (usada para buscar processos)
const LUSIO_API_URL = 'https://api.lusio.staging.goldenclouddev.com.br';
const LUSIO_CREDENTIALS = {
  email: 'admin@luzio.com',
  password: 'admin123',
};

/**
 * Autentica na API Lusio e retorna o token
 */
async function getLusioToken(): Promise<string | null> {
  try {
    const response = await fetch(`${LUSIO_API_URL}/operator/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(LUSIO_CREDENTIALS),
    });

    if (!response.ok) {
      console.error('Erro ao autenticar na API Lusio:', response.status);
      return null;
    }

    const data = await response.json();
    return data.token || null;
  } catch (error) {
    console.error('Erro ao conectar com API Lusio:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { login, password } = body;

    if (!login || !password) {
      return NextResponse.json(
        { success: false, error: 'Login e senha sao obrigatorios' },
        { status: 400 }
      );
    }

    const user = await verifyCredentials(login, password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Login ou senha invalidos' },
        { status: 401 }
      );
    }

    const token = generateToken(user);

    // Obter token da API Lusio (para buscar processos)
    const lusioToken = await getLusioToken();

    // Setar cookies
    const cookieStore = await cookies();

    // Cookie do auth local (httpOnly)
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    });

    // Cookie com dados do usuário (acessível no cliente)
    cookieStore.set('auth_user', JSON.stringify(user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    // Cookie do token Lusio (para API de processos)
    if (lusioToken) {
      cookieStore.set('lusio_operator_token', lusioToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });

      // Cookie com dados do operador Lusio
      cookieStore.set('lusio_operator_user', JSON.stringify({
        id: 'lusio-api',
        email: LUSIO_CREDENTIALS.email,
        name: 'API Lusio',
      }), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
