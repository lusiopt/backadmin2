import { NextResponse } from 'next/server';
import { getRolePermissions } from '@/lib/services/auth-local';

/**
 * GET /api/permissions - Lista permissões de todos os roles
 */
export async function GET() {
  try {
    const permissions = await getRolePermissions();
    return NextResponse.json({ success: true, permissions });
  } catch (error) {
    console.error('Erro ao listar permissões:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao listar permissões' },
      { status: 500 }
    );
  }
}
