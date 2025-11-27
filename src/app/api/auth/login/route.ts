import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyCredentials, generateToken } from '@/lib/services/auth-local';

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

    // Setar cookie httpOnly
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    });

    // Setar cookie com dados do usuário (acessível no cliente)
    cookieStore.set('auth_user', JSON.stringify(user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

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
