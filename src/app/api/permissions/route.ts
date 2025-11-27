import { NextResponse } from 'next/server';
import { getRolePermissions } from '@/lib/services/auth-local';

/**
 * GET /api/permissions - Lista permissões de todos os roles
 */
export async function GET() {
  try {
    const permissions = await getRolePermissions();

    // Normalizar chaves para lowercase (frontend usa UserRole enum com valores lowercase)
    const normalizedPermissions: Record<string, string[]> = {};
    for (const [role, perms] of Object.entries(permissions)) {
      normalizedPermissions[role.toLowerCase()] = perms;
    }

    return NextResponse.json({ success: true, permissions: normalizedPermissions });
  } catch (error) {
    console.error('Erro ao listar permissões:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao listar permissões' },
      { status: 500 }
    );
  }
}
