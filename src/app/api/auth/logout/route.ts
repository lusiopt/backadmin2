import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Deletar cookies de auth
    cookieStore.delete('auth_token');
    cookieStore.delete('auth_user');

    // Deletar cookies antigos da API Lusio (se existirem)
    cookieStore.delete('lusio_operator_token');
    cookieStore.delete('lusio_operator_user');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no logout:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao fazer logout' },
      { status: 500 }
    );
  }
}
