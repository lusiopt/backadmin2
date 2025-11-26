import { useMemo, useCallback } from "react";
import { Service, ServiceWithRelations, Permission } from "@/lib/types";
import { filterServicesByPhasePermissions } from "@/lib/permissions";

export interface FilterState {
  search: string;
  selectedStatuses: string[];
  dateFrom: string;
  dateTo: string;
  showPendingCommunications: boolean;
}

export interface SortState {
  sortColumn: 'name' | 'email' | 'status' | 'createdAt' | null;
  sortDirection: 'asc' | 'desc';
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

interface UseServiceFiltersParams {
  services: Service[];
  hasPermission: (permission: Permission) => boolean;
  filters: FilterState;
  sort: SortState;
  pagination: PaginationState;
  userId?: string;
}

export function useServiceFilters({
  services,
  hasPermission,
  filters,
  sort,
  pagination,
  userId,
}: UseServiceFiltersParams) {
  const { search, selectedStatuses, dateFrom, dateTo, showPendingCommunications } = filters;
  const { sortColumn, sortDirection } = sort;
  const { currentPage, itemsPerPage } = pagination;

  // Helper: count unread messages for a service
  const getUnreadMessagesCount = useCallback((service: Service): number => {
    if (!service.messages || !userId) return 0;
    return service.messages.filter(
      (m) => m.status === "unread" && m.senderId !== userId
    ).length;
  }, [userId]);

  // Layer 1: Filter by permissions (rarely changes)
  const accessibleServices = useMemo(() => {
    return filterServicesByPhasePermissions(services, hasPermission);
  }, [services, hasPermission]);

  // Layer 2: Filter by search/status/date (changes with user input)
  const filteredServices = useMemo(() => {
    return accessibleServices.filter((service) => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch =
          service.user?.fullName?.toLowerCase().includes(searchLower) ||
          service.user?.email?.toLowerCase().includes(searchLower) ||
          service.id.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (selectedStatuses.length > 0) {
        if (!service.status || !selectedStatuses.includes(service.status)) {
          return false;
        }
      }

      // Date filter
      if (dateFrom || dateTo) {
        const serviceDate = new Date(service.createdAt);
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          if (serviceDate < fromDate) return false;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (serviceDate > toDate) return false;
        }
      }

      // Pending communications filter
      if (showPendingCommunications) {
        const unreadCount = getUnreadMessagesCount(service);
        if (unreadCount === 0) return false;
      }

      return true;
    });
  }, [accessibleServices, search, selectedStatuses, dateFrom, dateTo, showPendingCommunications, getUnreadMessagesCount]);

  // Layer 3: Sorting (changes when clicking column)
  const sortedServices = useMemo(() => {
    if (!sortColumn) return filteredServices;

    return [...filteredServices].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortColumn) {
        case 'name':
          aValue = a.user?.fullName?.toLowerCase() || '';
          bValue = b.user?.fullName?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.user?.email?.toLowerCase() || '';
          bValue = b.user?.email?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.status?.toLowerCase() || '';
          bValue = b.status?.toLowerCase() || '';
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredServices, sortColumn, sortDirection]);

  // Unique statuses from accessible services
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(accessibleServices.map((s) => s.status).filter(Boolean));
    return Array.from(statuses);
  }, [accessibleServices]);

  // Pagination
  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedServices.slice(startIndex, endIndex);
  }, [sortedServices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedServices.length / itemsPerPage);

  // Group services by user (for by-user view)
  const servicesByUser = useMemo(() => {
    const grouped = new Map<string, ServiceWithRelations[]>();

    sortedServices.forEach((service) => {
      const serviceUserId = service.user?.id || '';
      if (!grouped.has(serviceUserId)) {
        grouped.set(serviceUserId, []);
      }
      grouped.get(serviceUserId)!.push(service as ServiceWithRelations);
    });

    return Array.from(grouped.entries()).map(([groupUserId, userServices]) => ({
      user: userServices[0].user,
      services: userServices,
      totalServices: userServices.length,
    }));
  }, [sortedServices]);

  // Stats
  const totalUnreadMessages = useMemo(() => {
    return services.reduce((total, service) => {
      return total + getUnreadMessagesCount(service);
    }, 0);
  }, [services, getUnreadMessagesCount]);

  const servicesWithNotifications = useMemo(() => {
    return services.filter(service => getUnreadMessagesCount(service) > 0);
  }, [services, getUnreadMessagesCount]);

  return {
    // Filtered data
    accessibleServices,
    filteredServices,
    sortedServices,
    paginatedServices,
    servicesByUser,

    // Metadata
    uniqueStatuses,
    totalPages,
    totalCount: sortedServices.length,

    // Stats
    totalUnreadMessages,
    servicesWithNotifications,

    // Helper
    getUnreadMessagesCount,
  };
}
