import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser, type UpdateUserData } from '@/lib/services/auth-local';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/users/[id] - Busca um usuário por ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getUserById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar usuário' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/users/[id] - Atualiza um usuário
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { fullName, email, role, password, active } = body;

    const updateData: UpdateUserData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (password) updateData.password = password;
    if (active !== undefined) updateData.active = active;

    const user = await updateUser(id, updateData);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    const message = error instanceof Error ? error.message : 'Erro ao atualizar usuário';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id] - Remove um usuário (soft delete)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await deleteUser(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao remover usuário' },
      { status: 500 }
    );
  }
}
