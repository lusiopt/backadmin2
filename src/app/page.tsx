"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useServices } from "@/hooks/services";
import { useServiceFilters } from "@/hooks/useServiceFilters";
import { Service, ServiceStatus, ServiceWithRelations, Permission } from "@/lib/types";
import { StatusBadge } from "@/components/pedidos/status-badge";
import { ServiceModal } from "@/components/pedidos/service-modal";
import { Input } from "@/components/ui/input";
import { ProfileSwitcher } from "@/components/ProfileSwitcher";
import { NotificationPanel } from "@/components/NotificationPanel";
import { ListView, ByUserView } from "@/components/views";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useLogout } from "@/hooks/auth";
import {
  Bell,
  RefreshCw,
  Settings,
  Search,
  LogOut,
  ChevronDown,
  MessageSquare
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const logout = useLogout();
  const [searchInput, setSearchInput] = useState(""); // Input temporário
  const [search, setSearch] = useState(""); // Busca real enviada para API
  const [viewMode, setViewMode] = useState<"list" | "by-user">("list");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showPendingCommunications, setShowPendingCommunications] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceWithRelations | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);

  // Hook React Query para buscar serviços da API
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useServices({
    page: 1,
    limit: 100, // Buscar todos para filtrar localmente
    status: selectedStatuses.length > 0 ? selectedStatuses[0] : undefined,
    search: search || undefined,
  });

  const services = data?.services || [];
  const isRefreshing = isFetching;

  // Sorting state
  const [sortColumn, setSortColumn] = useState<'name' | 'email' | 'status' | 'createdAt' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Use the filter hook
  const {
    paginatedServices,
    servicesByUser,
    uniqueStatuses,
    totalPages,
    totalCount,
    totalUnreadMessages,
    servicesWithNotifications,
    getUnreadMessagesCount,
  } = useServiceFilters({
    services,
    hasPermission,
    filters: {
      search,
      selectedStatuses,
      dateFrom,
      dateTo,
      showPendingCommunications,
    },
    sort: {
      sortColumn,
      sortDirection,
    },
    pagination: {
      currentPage,
      itemsPerPage,
    },
    userId: user?.id,
  });

  const handleRefresh = () => {
    refetch();
  };

  // Handle sorting
  const handleSort = (column: 'name' | 'email' | 'status' | 'createdAt') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleServiceClick = (service: ServiceWithRelations) => {
    setSelectedService(service);
  };

  const toggleUserExpand = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando serviços...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Error state
  if (isError) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Erro ao carregar serviços</p>
            <p className="text-gray-600 mb-4">{(error as any)?.message || 'Erro desconhecido'}</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      {/* Brand Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            {/* Logo Lusio */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg overflow-hidden">
              <Image
                src="/backadmin/logo-lusio.jpeg"
                alt="Lusio"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-lg sm:text-xl font-bold">Lusio Cidadania</h1>
              <p className="text-xs sm:text-sm text-blue-100">Sistema de Gestão de Processos</p>
            </div>

            {/* Botão Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="px-3 sm:px-4 lg:px-8 py-2 sm:py-3">
          <div className="flex items-center justify-center gap-1 sm:gap-3">
            {/* View Toggle */}
            <div className="flex gap-0.5 sm:gap-1 p-0.5 sm:p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                    viewMode === "list"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <span className="hidden sm:inline">📋</span> Lista
                  </span>
                </button>
                <button
                  onClick={() => setViewMode("by-user")}
                  className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                    viewMode === "by-user"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <span className="hidden sm:inline">👤</span> <span className="hidden lg:inline">Por </span>User
                  </span>
                </button>
              </div>

              {/* Actions */}
              <button
                onClick={handleRefresh}
                className={`p-1 sm:p-1.5 md:p-2 rounded-lg hover:bg-gray-100 transition-colors ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
                disabled={isRefreshing}
                title="Atualizar dados"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>

              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                  className="p-1 sm:p-1.5 md:p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                  title={`${totalUnreadMessages} notificação${totalUnreadMessages !== 1 ? 'ões' : ''} não lida${totalUnreadMessages !== 1 ? 's' : ''}`}
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  {totalUnreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] px-1 text-[9px] sm:text-[10px] font-bold bg-red-500 text-white rounded-full">
                      {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
                    </span>
                  )}
                </button>

                {/* Notification Panel Popup */}
                {showNotificationPanel && user && (
                  <NotificationPanel
                    services={services}
                    currentUserId={user.id}
                    onClose={() => setShowNotificationPanel(false)}
                    onOpenService={(serviceId) => {
                      const service = services.find(s => s.id === serviceId);
                      if (service) {
                        setSelectedService(service as ServiceWithRelations);
                      }
                    }}
                  />
                )}
              </div>

              {/* Settings - Only for admins - Now visible on mobile */}
              {hasPermission(Permission.MANAGE_USERS) && (
                <button
                  onClick={() => router.push("/configuracoes")}
                  className="p-1 sm:p-1.5 md:p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Configurações"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </button>
              )}

              {/* User Switcher (Shows current user and role) - Compact on mobile */}
              <div className="ml-0.5 sm:ml-2 md:ml-3 pl-0.5 sm:pl-2 md:pl-3 border-l border-gray-200">
                <ProfileSwitcher />
              </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-3 sm:mt-4">
            <div className="flex flex-col gap-2 sm:gap-3">
              {/* Search */}
              <div className="flex-1 flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar por nome, email ou ID..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setSearch(searchInput);
                      }
                    }}
                    className="pl-10 h-10"
                  />
                </div>
                <button
                  onClick={() => setSearch(searchInput)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Buscar
                </button>
                {search && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setSearchInput("");
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2 justify-center">
                {/* Pending Communications Filter */}
                <button
                  onClick={() => setShowPendingCommunications(!showPendingCommunications)}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors border ${
                    showPendingCommunications
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  title="Mostrar apenas processos com comunicações pendentes"
                >
                  <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Comunicações Pendentes</span>
                  <span className="sm:hidden">Comunic.</span>
                  {showPendingCommunications && servicesWithNotifications.length > 0 && (
                    <span className="ml-1 px-1.5 sm:px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {servicesWithNotifications.length}
                    </span>
                  )}
                </button>

                <div className={`relative ${showStatusFilter ? 'z-[300]' : 'z-10'}`}>
                  <button
                    onClick={() => setShowStatusFilter(!showStatusFilter)}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <span className="hidden sm:inline">📊</span> Status
                    {selectedStatuses.length > 0 && (
                      <span className="ml-1 px-1.5 sm:px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {selectedStatuses.length}
                      </span>
                    )}
                  </button>

                  {showStatusFilter && (
                    <div className="fixed sm:absolute top-20 sm:top-full left-6 right-6 sm:inset-x-auto sm:right-0 sm:left-auto sm:w-64 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-[200] max-h-[60vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-3 sm:hidden">
                        <span className="text-sm font-medium text-gray-700">Filtrar por Status</span>
                        <button
                          onClick={() => setShowStatusFilter(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="space-y-2">
                        {uniqueStatuses.map((status) => (
                          <label key={status} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={status ? selectedStatuses.includes(status) : false}
                              onChange={(e) => {
                                if (e.target.checked && status) {
                                  setSelectedStatuses([...selectedStatuses, status]);
                                } else {
                                  setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <StatusBadge status={status as ServiceStatus} />
                          </label>
                        ))}
                      </div>
                      {selectedStatuses.length > 0 && (
                        <button
                          onClick={() => setSelectedStatuses([])}
                          className="mt-3 w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Limpar filtros
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className={`relative ${showDateFilter ? 'z-[300]' : 'z-10'}`}>
                  <button
                    onClick={() => setShowDateFilter(!showDateFilter)}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <span className="hidden sm:inline">📅</span> Datas
                    {(dateFrom || dateTo) && (
                      <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </button>

                  {showDateFilter && (
                    <div className="fixed sm:absolute top-20 sm:top-full left-4 right-4 sm:inset-x-auto sm:right-0 sm:left-auto w-auto sm:w-72 max-w-[calc(100vw-2rem)] mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 sm:p-4 z-[200] overflow-hidden">
                      <div className="flex items-center justify-between mb-3 sm:hidden">
                        <span className="text-sm font-medium text-gray-700">Filtrar por Data</span>
                        <button
                          onClick={() => setShowDateFilter(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            De:
                          </label>
                          <div className="overflow-hidden rounded-md">
                            <input
                              type="date"
                              value={dateFrom}
                              onChange={(e) => setDateFrom(e.target.value)}
                              className="w-full sm:w-full max-w-full box-border px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Até:
                          </label>
                          <div className="overflow-hidden rounded-md">
                            <input
                              type="date"
                              value={dateTo}
                              onChange={(e) => setDateTo(e.target.value)}
                              className="w-full sm:w-full max-w-full box-border px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        {(dateFrom || dateTo) && (
                          <button
                            onClick={() => {
                              setDateFrom("");
                              setDateTo("");
                            }}
                            className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium mt-2"
                          >
                            Limpar datas
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4 sm:p-8">
        {viewMode === "list" ? (
          <ListView
            services={paginatedServices}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
            onPageChange={setCurrentPage}
            onServiceClick={handleServiceClick}
            onSort={handleSort}
            hasViewPermission={hasPermission(Permission.VIEW_SERVICES)}
            getUnreadMessagesCount={getUnreadMessagesCount}
          />
        ) : (
          <ByUserView
            servicesByUser={servicesByUser}
            expandedUsers={expandedUsers}
            onToggleUser={toggleUserExpand}
            onServiceClick={handleServiceClick}
            hasViewPermission={hasPermission(Permission.VIEW_SERVICES)}
            getUnreadMessagesCount={getUnreadMessagesCount}
          />
        )}
      </div>

      {/* Service Modal */}
      {selectedService && (
        <ServiceModal
          open={true}
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
      )}
    </div>
    </ProtectedRoute>
  );
}