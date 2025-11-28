"use client";

import { Service, Permission } from "@/lib/types";
import { StatusBadge } from "@/components/pedidos/status-badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Mail, Calendar, User, MessageSquare } from "lucide-react";

interface MobileServiceCardProps {
  service: Service;
  onViewDetails: () => void;
  hasViewPermission: boolean;
  unreadCount?: number;
}

export function MobileServiceCard({
  service,
  onViewDetails,
  hasViewPermission,
  unreadCount = 0
}: MobileServiceCardProps) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      onClick={onViewDetails}
    >
      {/* Header com Nome e Status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {service.person
              ? `${service.person.firstName || ''} ${service.person.lastName || ''}`.trim() || 'N/A'
              : service.user?.fullName || 'N/A'}
          </h3>
        </div>
        <StatusBadge status={service.status} />
      </div>

      {/* Informações */}
      <div className="space-y-2 mb-3">
        {/* Email */}
        <div className="flex items-center gap-2 text-sm">
          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {service.user?.email ? (
            <a
              href={`mailto:${service.user.email}`}
              className="text-blue-600 hover:underline truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {service.user.email}
            </a>
          ) : (
            <span className="text-gray-400 truncate">N/A</span>
          )}
        </div>

        {/* Data */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>{formatDate(service.createdAt)}</span>
        </div>

        {/* Mensagens não lidas */}
        {unreadCount > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <MessageSquare className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-red-600 font-medium">
              {unreadCount} comunicação{unreadCount !== 1 ? 'ões' : ''} pendente{unreadCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Botão de ação */}
      {hasViewPermission && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails();
          }}
          className="w-full bg-blue-600 text-white hover:bg-blue-700 relative"
          size="sm"
        >
          <span className="flex items-center justify-center gap-2">
            Ver Detalhes
            {unreadCount > 0 && (
              <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-red-500 text-white rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </span>
        </Button>
      )}
    </div>
  );
}
