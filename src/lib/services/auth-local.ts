import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, queryOne } from '@/lib/db/postgres';

// Tipos
export type UserRole = 'ADMIN' | 'BACKOFFICE' | 'ADVOGADA' | 'VISUALIZADOR';

export interface LocalUser {
  id: string;
  login: string;
  fullName: string;
  email: string | null;
  role: UserRole;
  active: boolean;
}

export interface JwtPayload {
  userId: string;
  login: string;
  role: UserRole;
}

interface DbUser {
  id: string;
  login: string;
  password_hash: string;
  full_name: string;
  email: string | null;
  role: UserRole;
  active: boolean;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const JWT_EXPIRES_IN = '24h';

/**
 * Verifica credenciais de login
 */
export async function verifyCredentials(login: string, password: string): Promise<LocalUser | null> {
  const user = await queryOne<DbUser>(
    `SELECT id, login, password_hash, full_name, email, role, active
     FROM users
     WHERE login = $1 AND active = true`,
    [login.toLowerCase()]
  );

  if (!user) return null;

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) return null;

  // Atualizar last_login_at
  await query(
    'UPDATE users SET last_login_at = NOW() WHERE id = $1',
    [user.id]
  );

  return {
    id: user.id,
    login: user.login,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    active: user.active,
  };
}

/**
 * Gera token JWT
 */
export function generateToken(user: LocalUser): string {
  const payload: JwtPayload = {
    userId: user.id,
    login: user.login,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifica token JWT
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Busca usuário por ID
 */
export async function getUserById(id: string): Promise<LocalUser | null> {
  const user = await queryOne<DbUser>(
    `SELECT id, login, full_name, email, role, active
     FROM users
     WHERE id = $1 AND active = true`,
    [id]
  );

  if (!user) return null;

  return {
    id: user.id,
    login: user.login,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    active: user.active,
  };
}

/**
 * Gera hash de senha (para criar usuários)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// =====================================================
// USERS CRUD
// =====================================================

export interface CreateUserData {
  login: string;
  password: string;
  fullName: string;
  email?: string;
  role: UserRole;
}

export interface UpdateUserData {
  fullName?: string;
  email?: string;
  role?: UserRole;
  password?: string;
  active?: boolean;
}

/**
 * Lista todos os usuários
 */
export async function listUsers(): Promise<LocalUser[]> {
  const users = await query<DbUser>(
    `SELECT id, login, full_name, email, role, active
     FROM users
     ORDER BY full_name ASC`
  );

  return users.map(user => ({
    id: user.id,
    login: user.login,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    active: user.active,
  }));
}

/**
 * Cria um novo usuário
 */
export async function createUser(data: CreateUserData): Promise<LocalUser> {
  const passwordHash = await hashPassword(data.password);

  const user = await queryOne<DbUser>(
    `INSERT INTO users (login, password_hash, full_name, email, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, login, full_name, email, role, active`,
    [data.login.toLowerCase(), passwordHash, data.fullName, data.email || null, data.role]
  );

  if (!user) {
    throw new Error('Erro ao criar usuário');
  }

  return {
    id: user.id,
    login: user.login,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    active: user.active,
  };
}

/**
 * Atualiza um usuário
 */
export async function updateUser(id: string, data: UpdateUserData): Promise<LocalUser> {
  const updates: string[] = [];
  const values: (string | boolean)[] = [];
  let paramIndex = 1;

  if (data.fullName !== undefined) {
    updates.push(`full_name = $${paramIndex++}`);
    values.push(data.fullName);
  }
  if (data.email !== undefined) {
    updates.push(`email = $${paramIndex++}`);
    values.push(data.email);
  }
  if (data.role !== undefined) {
    updates.push(`role = $${paramIndex++}`);
    values.push(data.role);
  }
  if (data.active !== undefined) {
    updates.push(`active = $${paramIndex++}`);
    values.push(data.active);
  }
  if (data.password) {
    const passwordHash = await hashPassword(data.password);
    updates.push(`password_hash = $${paramIndex++}`);
    values.push(passwordHash);
  }

  if (updates.length === 0) {
    throw new Error('Nenhum campo para atualizar');
  }

  values.push(id);

  const user = await queryOne<DbUser>(
    `UPDATE users
     SET ${updates.join(', ')}, updated_at = NOW()
     WHERE id = $${paramIndex}
     RETURNING id, login, full_name, email, role, active`,
    values
  );

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  return {
    id: user.id,
    login: user.login,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    active: user.active,
  };
}

/**
 * Remove um usuário (soft delete)
 */
export async function deleteUser(id: string): Promise<void> {
  const result = await query(
    'UPDATE users SET active = false, updated_at = NOW() WHERE id = $1',
    [id]
  );

  if (!result) {
    throw new Error('Usuário não encontrado');
  }
}

/**
 * Verifica se login já existe
 */
export async function loginExists(login: string, excludeId?: string): Promise<boolean> {
  const sql = excludeId
    ? 'SELECT 1 FROM users WHERE login = $1 AND id != $2'
    : 'SELECT 1 FROM users WHERE login = $1';
  const params = excludeId ? [login.toLowerCase(), excludeId] : [login.toLowerCase()];

  const result = await queryOne<{ '1': number }>(sql, params);
  return !!result;
}

// =====================================================
// PERMISSIONS
// =====================================================

interface DbRolePermissions {
  role: string;
  permissions: string[];
}

/**
 * Busca permissões de todos os roles
 */
export async function getRolePermissions(): Promise<Record<string, string[]>> {
  const rows = await query<DbRolePermissions>(
    'SELECT role, permissions FROM role_permissions'
  );

  const result: Record<string, string[]> = {};
  for (const row of rows) {
    result[row.role] = row.permissions;
  }
  return result;
}

/**
 * Busca permissões de um role específico
 */
export async function getPermissionsByRole(role: string): Promise<string[]> {
  const row = await queryOne<DbRolePermissions>(
    'SELECT permissions FROM role_permissions WHERE role = $1',
    [role]
  );

  return row?.permissions || [];
}

/**
 * Atualiza permissões de um role
 */
export async function updateRolePermissions(role: string, permissions: string[]): Promise<void> {
  await query(
    `INSERT INTO role_permissions (role, permissions, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (role) DO UPDATE SET permissions = $2, updated_at = NOW()`,
    [role, permissions]
  );
}
