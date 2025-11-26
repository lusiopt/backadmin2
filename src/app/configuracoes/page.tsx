"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole, Permission, AuthUser } from "@/lib/types";
import { mockSystemUsers } from "@/lib/mockData";
import { Plus, Edit, Trash2, X, Eye, EyeOff, Users, Shield, Check, ArrowLeft } from "lucide-react";

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Admin",
  [UserRole.BACKOFFICE]: "Backoffice",
  [UserRole.ADVOGADA]: "Advogada",
  [UserRole.VISUALIZADOR]: "Visualizador",
};

const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.ADMIN]: "bg-purple-100 text-purple-800 border-purple-200",
  [UserRole.BACKOFFICE]: "bg-blue-100 text-blue-800 border-blue-200",
  [UserRole.ADVOGADA]: "bg-green-100 text-green-800 border-green-200",
  [UserRole.VISUALIZADOR]: "bg-gray-100 text-gray-800 border-gray-200",
};

const PERMISSION_LABELS: Record<Permission, { label: string; description: string; category: string }> = {
  [Permission.VIEW_SERVICES]: {
    label: "Ver Serviços",
    description: "Visualizar lista de serviços",
    category: "Serviços"
  },
  [Permission.CREATE_SERVICE]: {
    label: "Criar Serviço",
    description: "Criar novos serviços",
    category: "Serviços"
  },
  [Permission.EDIT_SERVICE]: {
    label: "Editar Serviço",
    description: "Editar serviços existentes",
    category: "Serviços"
  },
  [Permission.DELETE_SERVICE]: {
    label: "Deletar Serviço",
    description: "Remover serviços",
    category: "Serviços"
  },
  [Permission.CHANGE_STATUS]: {
    label: "Mudar Status",
    description: "Alterar status de serviços",
    category: "Serviços"
  },
  [Permission.VIEW_DOCUMENTS]: {
    label: "Ver Documentos",
    description: "Visualizar documentos",
    category: "Documentos"
  },
  [Permission.UPLOAD_DOCUMENTS]: {
    label: "Upload Documentos",
    description: "Fazer upload de documentos",
    category: "Documentos"
  },
  [Permission.DELETE_DOCUMENTS]: {
    label: "Deletar Documentos",
    description: "Remover documentos",
    category: "Documentos"
  },
  [Permission.VIEW_USERS]: {
    label: "Ver Usuários",
    description: "Visualizar lista de usuários",
    category: "Usuários"
  },
  [Permission.MANAGE_USERS]: {
    label: "Gerenciar Usuários",
    description: "Criar, editar e remover usuários",
    category: "Usuários"
  },
  [Permission.VIEW_ALL_SERVICES]: {
    label: "Ver Todos os Serviços",
    description: "Ver processos de todos os usuários",
    category: "Especial"
  },
  [Permission.ASSIGN_SERVICES]: {
    label: "Atribuir Serviços",
    description: "Atribuir processos a outros usuários",
    category: "Especial"
  },
  [Permission.VIEW_STATISTICS]: {
    label: "Ver Estatísticas",
    description: "Acessar dashboards e relatórios",
    category: "Especial"
  },
  [Permission.EXPORT_DATA]: {
    label: "Exportar Dados",
    description: "Exportar dados do sistema",
    category: "Especial"
  },
  // Phase-specific permissions
  [Permission.ACCESS_STEP_1]: {
    label: "Passo 1",
    description: "Acesso a processos no Passo 1",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_STEP_2]: {
    label: "Passo 2",
    description: "Acesso a processos no Passo 2",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_STEP_3]: {
    label: "Passo 3",
    description: "Acesso a processos no Passo 3",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_STEP_4]: {
    label: "Passo 4",
    description: "Acesso a processos no Passo 4",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_STEP_5]: {
    label: "Passo 5",
    description: "Acesso a processos no Passo 5",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_STEP_6]: {
    label: "Passo 6",
    description: "Acesso a processos no Passo 6",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_STEP_7]: {
    label: "Passo 7",
    description: "Acesso a processos no Passo 7 (todas variações)",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_STEP_8]: {
    label: "Passo 8",
    description: "Acesso a processos no Passo 8 (todas variações)",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_CANCELLED]: {
    label: "Cancelado",
    description: "Acesso a processos cancelados",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_SUBMITTED]: {
    label: "Submetido",
    description: "Acesso a processos submetidos",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_UNDER_ANALYSIS]: {
    label: "Em Análise",
    description: "Acesso a processos em análise",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_WAITING_RESPONSE]: {
    label: "Aguarda Resposta",
    description: "Acesso a processos aguardando resposta",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_FOR_DECISION]: {
    label: "Para Decisão",
    description: "Acesso a processos para decisão",
    category: "Acesso por Fase"
  },
  [Permission.ACCESS_COMPLETED]: {
    label: "Concluído",
    description: "Acesso a processos concluídos",
    category: "Acesso por Fase"
  },
};

interface UserFormData {
  id?: string;
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export default function ConfigPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");

  // User Management State
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    fullName: "",
    email: "",
    password: "",
    role: UserRole.VISUALIZADOR,
  });

  // Role Permissions State
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.ADMIN);
  const [configs, setConfigs] = useState<Record<UserRole, Permission[]>>({
    [UserRole.ADMIN]: Object.values(Permission),
    [UserRole.BACKOFFICE]: [],
    [UserRole.ADVOGADA]: [],
    [UserRole.VISUALIZADOR]: [],
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load users from localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem("backadmin_users");
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch (e) {
        console.error("Error loading users:", e);
        setUsers(mockSystemUsers);
      }
    } else {
      setUsers(mockSystemUsers);
      localStorage.setItem("backadmin_users", JSON.stringify(mockSystemUsers));
    }
  }, []);

  // Load role permissions from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem("role_permissions_config");
    if (savedConfig) {
      try {
        setConfigs(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Error loading permissions:", e);
      }
    }
  }, []);

  // Check permission
  if (!user || !hasPermission(Permission.MANAGE_USERS)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar configurações.</p>
        </div>
      </div>
    );
  }

  // User Management Functions
  const saveUsers = (newUsers: AuthUser[]) => {
    setUsers(newUsers);
    localStorage.setItem("backadmin_users", JSON.stringify(newUsers));
  };

  const openModal = (user?: AuthUser) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        password: "",
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        fullName: "",
        email: "",
        password: "",
        role: UserRole.VISUALIZADOR,
      });
    }
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      fullName: "",
      email: "",
      password: "",
      role: UserRole.VISUALIZADOR,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      const updatedUsers = users.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              fullName: formData.fullName,
              email: formData.email,
              role: formData.role,
              ...(formData.password ? { password: formData.password } : {}),
            }
          : u
      );
      saveUsers(updatedUsers);
    } else {
      const newUser: AuthUser = {
        id: `user_${Date.now()}`,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        active: true,
        createdAt: new Date().toISOString(),
      };
      saveUsers([...users, newUser]);
    }

    closeModal();
  };

  const handleDelete = (userId: string) => {
    if (userId === user.id) {
      alert("Você não pode deletar seu próprio usuário!");
      return;
    }

    if (confirm("Tem certeza que deseja deletar este usuário?")) {
      const updatedUsers = users.filter((u) => u.id !== userId);
      saveUsers(updatedUsers);
    }
  };

  // Role Permissions Functions
  const togglePermission = (role: UserRole, permission: Permission) => {
    setConfigs((prev) => {
      const current = prev[role] || [];
      const updated = current.includes(permission)
        ? current.filter((p) => p !== permission)
        : [...current, permission];

      setHasChanges(true);
      return { ...prev, [role]: updated };
    });
  };

  const toggleAllCategoryPermissions = (role: UserRole, category: string, permissions: Permission[]) => {
    setConfigs(prev => {
      const rolePerms = prev[role] || [];
      // Verificar se todas as permissões da categoria já estão selecionadas
      const allSelected = permissions.every(p => rolePerms.includes(p));

      let newPermissions: Permission[];
      if (allSelected) {
        // Remover todas as permissões da categoria
        newPermissions = rolePerms.filter(p => !permissions.includes(p));
      } else {
        // Adicionar todas as permissões da categoria
        const permissionsToAdd = permissions.filter(p => !rolePerms.includes(p));
        newPermissions = [...rolePerms, ...permissionsToAdd];
      }

      setHasChanges(true);
      return {
        ...prev,
        [role]: newPermissions
      };
    });
  };

  const saveConfig = () => {
    localStorage.setItem("role_permissions_config", JSON.stringify(configs));
    setHasChanges(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const resetConfig = () => {
    if (confirm("Tem certeza que deseja resetar todas as configurações?")) {
      localStorage.removeItem("role_permissions_config");
      window.location.reload();
    }
  };

  const categories = Array.from(
    new Set(Object.values(PERMISSION_LABELS).map((p) => p.category))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start gap-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1"
              title="Voltar para a página inicial"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Configurações do Sistema
              </h1>
              <p className="text-gray-600">
                Gerencie usuários e configure permissões para cada perfil.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("users")}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === "users"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Users className="w-5 h-5" />
                Usuários
              </button>
              <button
                onClick={() => setActiveTab("roles")}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 ${
                  activeTab === "roles"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Shield className="w-5 h-5" />
                Perfis e Permissões
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "users" ? (
              // Users Tab
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Gerenciar Usuários</h2>
                    <p className="text-sm text-gray-600">
                      Crie e gerencie usuários do sistema com seus perfis.
                    </p>
                  </div>
                  <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Novo Usuário
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Perfil
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                {u.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div className="font-medium text-gray-900">{u.fullName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                            {u.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                                ROLE_COLORS[u.role]
                              }`}
                            >
                              {ROLE_LABELS[u.role]}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openModal(u)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar usuário"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(u.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Deletar usuário"
                                disabled={u.id === user.id}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {users.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    Nenhum usuário cadastrado. Clique em "Novo Usuário" para começar.
                  </div>
                )}
              </div>
            ) : (
              // Roles Tab
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Configurar Permissões</h2>
                    <p className="text-sm text-gray-600">
                      Defina as permissões para cada perfil de usuário.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={resetConfig}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Resetar
                    </button>
                    <button
                      onClick={saveConfig}
                      disabled={!hasChanges}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        hasChanges
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {saveSuccess ? (
                        <>
                          <Check className="w-5 h-5" />
                          Salvo!
                        </>
                      ) : (
                        "Salvar Alterações"
                      )}
                    </button>
                  </div>
                </div>

                {/* Role Selector */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecione o perfil para editar permissões:
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(ROLE_LABELS).map(([roleKey, roleLabel]) => {
                      const role = roleKey as UserRole;
                      const isSelected = selectedRole === role;
                      return (
                        <button
                          key={role}
                          onClick={() => setSelectedRole(role)}
                          className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                            isSelected
                              ? ROLE_COLORS[role] + " shadow-md"
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          <div className="text-sm">{roleLabel}</div>
                          <div className="text-xs mt-1 opacity-75">
                            {configs[role]?.length || 0} permissões
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Role Permissions */}
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <span
                      className={`px-4 py-2 rounded-lg text-sm font-bold border-2 ${ROLE_COLORS[selectedRole]}`}
                    >
                      {ROLE_LABELS[selectedRole]}
                    </span>
                    <span className="text-sm text-gray-500">
                      {configs[selectedRole]?.length || 0} permissões ativas
                    </span>
                  </div>

                  <div className="space-y-6">
                    {categories.map((category) => {
                      const categoryPermissions = Object.entries(PERMISSION_LABELS)
                        .filter(([_, info]) => info.category === category)
                        .map(([perm]) => perm as Permission);

                      const allSelected = categoryPermissions.every(p => configs[selectedRole]?.includes(p));
                      const someSelected = categoryPermissions.some(p => configs[selectedRole]?.includes(p));

                      return (
                        <div key={category}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-700">
                              {category}
                            </h4>
                            <button
                              onClick={() => toggleAllCategoryPermissions(selectedRole, category, categoryPermissions)}
                              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                                allSelected
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              }`}
                            >
                              {allSelected ? "Desmarcar Todos" : someSelected ? "Selecionar Todos" : "Selecionar Todos"}
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {categoryPermissions.map((permission) => {
                              const info = PERMISSION_LABELS[permission];
                              const isChecked = configs[selectedRole]?.includes(permission);

                              return (
                                <label
                                  key={permission}
                                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                    isChecked
                                      ? "border-blue-300 bg-blue-50"
                                      : "border-gray-200 hover:border-gray-300"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => togglePermission(selectedRole, permission)}
                                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <div className="flex-1">
                                    <div className="font-medium text-sm text-gray-900">
                                      {info.label}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {info.description}
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingUser ? "Editar Usuário" : "Novo Usuário"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha {editingUser ? "(deixe vazio para manter)" : "*"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    required={!editingUser}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Perfil *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingUser ? "Salvar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
