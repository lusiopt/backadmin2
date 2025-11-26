import { ServiceStatus, Permission } from "./types";

/**
 * Mapeamento de status de serviço para permissões necessárias para visualizá-los
 */
export const STATUS_TO_PERMISSION_MAP: Record<string, Permission> = {
  // Passos 1-8
  "Passo 1": Permission.ACCESS_STEP_1,
  "Passo 2": Permission.ACCESS_STEP_2,
  "Passo 3": Permission.ACCESS_STEP_3,
  "Passo 4": Permission.ACCESS_STEP_4,
  "Passo 5": Permission.ACCESS_STEP_5,
  "Passo 6": Permission.ACCESS_STEP_6,
  "Passo 7": Permission.ACCESS_STEP_7,
  "Passo 7 Esperando": Permission.ACCESS_STEP_7,
  "Passo 7 Aprovado": Permission.ACCESS_STEP_7,
  "Passo 7 Recusado": Permission.ACCESS_STEP_7,
  "Passo 7 Quase": Permission.ACCESS_STEP_7,
  "Passo 8": Permission.ACCESS_STEP_8,
  "Passo 8 Confirmado pelo Cliente": Permission.ACCESS_STEP_8,
  "Passo 8 Confirmado pelo Governo": Permission.ACCESS_STEP_8,

  // Status especiais
  "Cancelado": Permission.ACCESS_CANCELLED,
  "Submetido": Permission.ACCESS_SUBMITTED,
  "Em análise": Permission.ACCESS_UNDER_ANALYSIS,
  "Aguarda resposta": Permission.ACCESS_WAITING_RESPONSE,
  "Para decisão": Permission.ACCESS_FOR_DECISION,
  "Concluído": Permission.ACCESS_COMPLETED,
};

/**
 * Verifica se um usuário tem permissão para visualizar um serviço baseado no seu status
 * @param status - Status do serviço
 * @param hasPermissionFn - Função hasPermission do contexto de autenticação
 * @returns true se o usuário tem permissão, false caso contrário
 */
export function canViewServiceByStatus(
  status: string | null | undefined,
  hasPermissionFn: (permission: Permission) => boolean
): boolean {
  // Se não há status definido, permitir visualização (fallback seguro)
  if (!status) return true;

  // Buscar a permissão necessária para este status
  const requiredPermission = STATUS_TO_PERMISSION_MAP[status];

  // Se não há permissão mapeada, permitir visualização (fallback seguro para novos status)
  if (!requiredPermission) return true;

  // Verificar se o usuário tem a permissão necessária
  return hasPermissionFn(requiredPermission);
}

/**
 * Filtra uma lista de serviços baseado nas permissões de fase do usuário
 * @param services - Array de serviços a filtrar
 * @param hasPermissionFn - Função hasPermission do contexto de autenticação
 * @returns Array de serviços que o usuário tem permissão para visualizar
 */
export function filterServicesByPhasePermissions<T extends { status: string | null }>(
  services: T[],
  hasPermissionFn: (permission: Permission) => boolean
): T[] {
  return services.filter(service => canViewServiceByStatus(service.status, hasPermissionFn));
}
