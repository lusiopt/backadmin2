"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Permission, UserRole } from "@/lib/types";
import { Shield, Eye, Edit, Trash2, Upload, Download, Users, BarChart3 } from "lucide-react";

const permissionIcons: Record<string, React.ElementType> = {
  [Permission.VIEW_SERVICES]: Eye,
  [Permission.EDIT_SERVICE]: Edit,
  [Permission.DELETE_SERVICE]: Trash2,
  [Permission.UPLOAD_DOCUMENTS]: Upload,
  [Permission.DELETE_DOCUMENTS]: Trash2,
  [Permission.MANAGE_USERS]: Users,
  [Permission.EXPORT_DATA]: Download,
  [Permission.VIEW_STATISTICS]: BarChart3,
  [Permission.CHANGE_STATUS]: Shield,
};

const permissionLabels: Record<Permission, string> = {
  [Permission.VIEW_SERVICES]: "Visualizar",
  [Permission.CREATE_SERVICE]: "Criar",
  [Permission.EDIT_SERVICE]: "Editar",
  [Permission.DELETE_SERVICE]: "Excluir",
  [Permission.CHANGE_STATUS]: "Alterar Status",
  [Permission.VIEW_DOCUMENTS]: "Ver Docs",
  [Permission.UPLOAD_DOCUMENTS]: "Upload Docs",
  [Permission.DELETE_DOCUMENTS]: "Excluir Docs",
  [Permission.VIEW_USERS]: "Ver Usuários",
  [Permission.MANAGE_USERS]: "Gerenciar Users",
  [Permission.VIEW_ALL_SERVICES]: "Ver Todos",
  [Permission.ASSIGN_SERVICES]: "Atribuir",
  [Permission.VIEW_STATISTICS]: "Estatísticas",
  [Permission.EXPORT_DATA]: "Exportar",
  // Phase-specific permissions
  [Permission.ACCESS_STEP_1]: "Passo 1",
  [Permission.ACCESS_STEP_2]: "Passo 2",
  [Permission.ACCESS_STEP_3]: "Passo 3",
  [Permission.ACCESS_STEP_4]: "Passo 4",
  [Permission.ACCESS_STEP_5]: "Passo 5",
  [Permission.ACCESS_STEP_6]: "Passo 6",
  [Permission.ACCESS_STEP_7]: "Passo 7",
  [Permission.ACCESS_STEP_8]: "Passo 8",
  [Permission.ACCESS_CANCELLED]: "Cancelado",
  [Permission.ACCESS_SUBMITTED]: "Submetido",
  [Permission.ACCESS_UNDER_ANALYSIS]: "Em Análise",
  [Permission.ACCESS_WAITING_RESPONSE]: "Aguardando Resposta",
  [Permission.ACCESS_FOR_DECISION]: "Para Decisão",
  [Permission.ACCESS_COMPLETED]: "Concluído",
};

export function PermissionIndicator() {
  const { user, hasPermission } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  // Only render on client-side to avoid SSR issues
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !user) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-100 rounded-lg">
        <div className="w-3.5 h-3.5 animate-pulse bg-gray-300 rounded"></div>
        <span className="text-gray-400">Carregando...</span>
      </div>
    );
  }

  // Get user's permissions that they actually have
  const userPermissions = Object.values(Permission).filter(p => hasPermission(p));

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        title="Ver permissões do seu perfil"
      >
        <Shield className="w-3.5 h-3.5 text-gray-600" />
        <span className="text-gray-700 font-medium">Permissões</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Suas Permissões
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Ações disponíveis no seu perfil
              </p>
            </div>

            {/* Permissions Grid */}
            <div className="p-3 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                {userPermissions.map((permission) => {
                  const Icon = permissionIcons[permission] || Shield;
                  const label = permissionLabels[permission] || permission;

                  return (
                    <div
                      key={permission}
                      className="flex items-center gap-2 px-2 py-2 bg-green-50 border border-green-200 rounded text-xs"
                    >
                      <Icon className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                      <span className="text-green-800 font-medium">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
              <p className="text-xs text-blue-800">
                <span className="font-semibold">ℹ️ Dica:</span> As funcionalidades são ajustadas automaticamente de acordo com suas permissões.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
