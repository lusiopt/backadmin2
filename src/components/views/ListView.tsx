"use client";

import { ReactNode } from "react";
import { Service, ServiceStatus, ServiceWithRelations, Permission } from "@/lib/types";
import { StatusBadge } from "@/components/pedidos/status-badge";
import { Card } from "@/components/ui/card";
import { MobileServiceCard } from "@/components/tables/MobileServiceCard";
import { formatDate } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

type SortColumn = 'name' | 'email' | 'status' | 'createdAt';

interface ListViewProps {
  services: Service[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  sortColumn: SortColumn | null;
  sortDirection: 'asc' | 'desc';
  onItemsPerPageChange: (value: number) => void;
  onPageChange: (page: number) => void;
  onServiceClick: (service: ServiceWithRelations) => void;
  onSort: (column: SortColumn) => void;
  hasViewPermission: boolean;
  getUnreadMessagesCount: (service: Service) => number;
}

export function ListView({
  services,
  totalCount,
  currentPage,
  totalPages,
  itemsPerPage,
  sortColumn,
  sortDirection,
  onItemsPerPageChange,
  onPageChange,
  onServiceClick,
  onSort,
  hasViewPermission,
  getUnreadMessagesCount,
}: ListViewProps) {
  const renderSortIcon = (column: SortColumn): ReactNode => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  return (
    <>
      {/* List Header */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-bold">
          Processos ({totalCount})
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Items por página:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View - Hidden on mobile */}
      <Card className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => onSort('name')}
                    className="flex items-center gap-2 hover:text-gray-900 transition-colors"
                  >
                    Nome
                    {renderSortIcon('name')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => onSort('email')}
                    className="flex items-center gap-2 hover:text-gray-900 transition-colors"
                  >
                    Email
                    {renderSortIcon('email')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => onSort('status')}
                    className="flex items-center gap-2 hover:text-gray-900 transition-colors"
                  >
                    Status
                    {renderSortIcon('status')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => onSort('createdAt')}
                    className="flex items-center gap-2 hover:text-gray-900 transition-colors"
                  >
                    Criado Em
                    {renderSortIcon('createdAt')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {services.map((service) => (
                <tr
                  key={service.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onServiceClick(service as ServiceWithRelations)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 font-mono">
                      {service.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {service.user?.fullName || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {service.user?.email ? (
                      <a
                        href={`mailto:${service.user.email}`}
                        className="text-sm text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {service.user.email}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={service.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {formatDate(service.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {hasViewPermission && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onServiceClick(service as ServiceWithRelations);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium relative inline-flex items-center gap-2"
                      >
                        Ver Detalhes
                        {getUnreadMessagesCount(service) > 0 && (
                          <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full">
                            {getUnreadMessagesCount(service)}
                          </span>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalCount === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Nenhum processo encontrado
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Tente ajustar os filtros ou a busca
              </p>
            </div>
          )}
        </div>

        {/* Pagination Controls - Desktop */}
        {totalCount > 0 && (
          <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalCount)} de {totalCount} resultados
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    return page === 1 ||
                           page === totalPages ||
                           (page >= currentPage - 1 && page <= currentPage + 1);
                  })
                  .map((page, index, array) => {
                    const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;

                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsisBefore && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => onPageChange(page)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  })}
              </div>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Mobile Cards View - Hidden on desktop */}
      <div className="lg:hidden space-y-3">
        {services.map((service) => (
          <MobileServiceCard
            key={service.id}
            service={service}
            onViewDetails={() => onServiceClick(service as ServiceWithRelations)}
            hasViewPermission={hasViewPermission}
            unreadCount={getUnreadMessagesCount(service)}
          />
        ))}

        {totalCount === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">
              Nenhum processo encontrado
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Tente ajustar os filtros ou a busca
            </p>
          </div>
        )}

        {/* Pagination Mobile */}
        {totalCount > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-600 text-center mb-3">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalCount)} de {totalCount}
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <span className="px-3 py-2 text-sm font-medium text-gray-700">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
