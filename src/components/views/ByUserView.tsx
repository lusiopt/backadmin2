"use client";

import { Service, ServiceWithRelations, User } from "@/lib/types";
import { StatusBadge } from "@/components/pedidos/status-badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface UserGroup {
  user: User | undefined;
  services: ServiceWithRelations[];
  totalServices: number;
}

interface ByUserViewProps {
  servicesByUser: UserGroup[];
  expandedUsers: Set<string>;
  onToggleUser: (userId: string) => void;
  onServiceClick: (service: ServiceWithRelations) => void;
  hasViewPermission: boolean;
  getUnreadMessagesCount: (service: Service) => number;
}

export function ByUserView({
  servicesByUser,
  expandedUsers,
  onToggleUser,
  onServiceClick,
  hasViewPermission,
  getUnreadMessagesCount,
}: ByUserViewProps) {
  return (
    <>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold">
          Por Usuário ({servicesByUser.length} usuários)
        </h2>
      </div>

      <div className="space-y-4">
        {servicesByUser.map((userGroup) => {
          if (!userGroup.user) return null;
          const isExpanded = expandedUsers.has(userGroup.user.id);

          return (
            <Card key={userGroup.user.id} className="overflow-hidden">
              {/* User Header - Clickable */}
              <div
                className="bg-gray-50 px-6 py-4 border-b cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onToggleUser(userGroup.user?.id || '')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {userGroup.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {userGroup.user?.fullName || 'N/A'}
                      </h3>
                      {userGroup.user?.email ? (
                        <a
                          href={`mailto:${userGroup.user.email}`}
                          className="text-sm text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {userGroup.user.email}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {userGroup.totalServices}
                      </div>
                      <div className="text-sm text-gray-500">
                        {userGroup.totalServices === 1 ? "processo" : "processos"}
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Services Table - Collapsible */}
              {isExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Criado Em
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {userGroup.services.map((service) => (
                        <tr
                          key={service.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => onServiceClick(service)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500 font-mono">
                              {service.id}
                            </div>
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
                                  onServiceClick(service);
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
                </div>
              )}
            </Card>
          );
        })}

        {servicesByUser.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Nenhum usuário encontrado
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Tente ajustar os filtros ou a busca
            </p>
          </div>
        )}
      </div>
    </>
  );
}
