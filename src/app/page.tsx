"use client";

import { useState, useEffect } from "react";
import { useServices } from "@/hooks/services";
import { useServiceFilters } from "@/hooks/useServiceFilters";
import { ServiceWithRelations, Permission } from "@/lib/types";
import { ServiceModal } from "@/components/pedidos/service-modal";
import { ListView, ByUserView } from "@/components/views";
import { ServiceListSkeleton } from "@/components/skeletons";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Header } from "@/components/layout/header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "by-user">("list");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showPendingCommunications, setShowPendingCommunications] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceWithRelations | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Hook React Query para buscar servicos da API
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useServices({
    page: 1,
    limit: 50,
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

  const handleOpenService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service as ServiceWithRelations);
    }
  };

  // Loading state - Skeleton Screen
  if (isLoading) {
    return (
      <ProtectedRoute>
        <SidebarInset>
          <div className="flex-1 p-4 sm:p-6">
            <ServiceListSkeleton />
          </div>
        </SidebarInset>
      </ProtectedRoute>
    );
  }

  // Error state
  if (isError) {
    return (
      <ProtectedRoute>
        <SidebarInset>
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <p className="text-destructive mb-4">Erro ao carregar servicos</p>
              <p className="text-muted-foreground mb-4">{(error as any)?.message || 'Erro desconhecido'}</p>
              <Button onClick={() => refetch()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          </div>
        </SidebarInset>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarInset>
        {/* Header with search and filters */}
        <Header
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          search={search}
          setSearch={setSearch}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          uniqueStatuses={uniqueStatuses}
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          showPendingCommunications={showPendingCommunications}
          setShowPendingCommunications={setShowPendingCommunications}
          servicesWithNotifications={servicesWithNotifications}
          totalUnreadMessages={totalUnreadMessages}
          services={services}
          currentUserId={user?.id}
          onOpenService={handleOpenService}
        />

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "by-user")}>
            {/* Title with Tabs */}
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Processos</h2>
                <TabsList className="mt-2 bg-muted">
                  <TabsTrigger value="list">Lista</TabsTrigger>
                  <TabsTrigger value="by-user">Por Usuario</TabsTrigger>
                </TabsList>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{totalCount} processos</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-sm text-muted-foreground">Items:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Tab Contents */}
            <TabsContent value="list" className="mt-0">
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
            </TabsContent>

            <TabsContent value="by-user" className="mt-0">
              <ByUserView
                servicesByUser={servicesByUser}
                expandedUsers={expandedUsers}
                onToggleUser={toggleUserExpand}
                onServiceClick={handleServiceClick}
                hasViewPermission={hasPermission(Permission.VIEW_SERVICES)}
                getUnreadMessagesCount={getUnreadMessagesCount}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Service Modal */}
        {selectedService && (
          <ServiceModal
            open={true}
            service={selectedService}
            onClose={() => setSelectedService(null)}
          />
        )}
      </SidebarInset>
    </ProtectedRoute>
  );
}
