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
