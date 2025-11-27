import { NextRequest, NextResponse } from 'next/server';
import { listUsers, createUser, loginExists, type CreateUserData } from '@/lib/services/auth-local';

/**
 * GET /api/users - Lista todos os usuários
 */
export async function GET() {
  try {
    const users = await listUsers();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao listar usuários' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users - Cria um novo usuário
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { login, password, fullName, email, role } = body;

    // Validações
    if (!login || !password || !fullName || !role) {
      return NextResponse.json(
        { success: false, error: 'Login, senha, nome e perfil são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se login já existe
    const exists = await loginExists(login);
    if (exists) {
      return NextResponse.json(
        { success: false, error: 'Login já existe' },
        { status: 409 }
      );
    }

    const userData: CreateUserData = {
      login,
      password,
      fullName,
      email: email || undefined,
      role,
    };

    const user = await createUser(userData);

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}
