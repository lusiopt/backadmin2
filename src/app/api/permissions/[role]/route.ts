import { NextRequest, NextResponse } from 'next/server';
import { updateRolePermissions, getPermissionsByRole } from '@/lib/services/auth-local';

interface RouteParams {
  params: Promise<{ role: string }>;
}

/**
 * GET /api/permissions/[role] - Busca permissões de um role específico
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { role } = await params;
    const permissions = await getPermissionsByRole(role.toUpperCase());

    return NextResponse.json({ success: true, role: role.toUpperCase(), permissions });
  } catch (error) {
    console.error('Erro ao buscar permissões:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar permissões' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/permissions/[role] - Atualiza permissões de um role
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { role } = await params;
    const body = await request.json();
    const { permissions } = body;

    if (!permissions || !Array.isArray(permissions)) {
      return NextResponse.json(
        { success: false, error: 'Permissões devem ser um array' },
        { status: 400 }
      );
    }

    await updateRolePermissions(role.toUpperCase(), permissions);

    return NextResponse.json({ success: true, role: role.toUpperCase(), permissions });
  } catch (error) {
    console.error('Erro ao atualizar permissões:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar permissões' },
      { status: 500 }
    );
  }
}
