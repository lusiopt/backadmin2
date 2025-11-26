"use client";

import React from "react";
import { X, MessageSquare, AlertCircle, FileText, Clock } from "lucide-react";
import { Service, Message, MessageType, UserRole } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NotificationPanelProps {
  services: Service[];
  currentUserId: string;
  onClose: () => void;
  onOpenService: (serviceId: string) => void;
  embedded?: boolean; // When true, renders without fixed positioning (for use in Popover)
}

export function NotificationPanel({
  services,
  currentUserId,
  onClose,
  onOpenService,
  embedded = false,
}: NotificationPanelProps) {
  // Agregar todas as mensagens não lidas de todos os serviços
  const unreadNotifications = services
    .flatMap((service) => {
      if (!service.messages) return [];

      return service.messages
        .filter((msg) => msg.status === "unread" && msg.senderId !== currentUserId)
        .map((msg) => ({
          ...msg,
          service,
        }));
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Mais recentes primeiro
    });

  const getMessageIcon = (type: MessageType) => {
    switch (type) {
      case MessageType.LAWYER_REQUEST:
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case MessageType.BACKOFFICE_RESPONSE:
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case MessageType.SYSTEM:
        return <FileText className="w-4 h-4 text-gray-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADVOGADA:
        return "bg-purple-100 text-purple-800";
      case UserRole.BACKOFFICE:
        return "bg-blue-100 text-blue-800";
      case UserRole.ADMIN:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.ADVOGADA:
        return "Advogada";
      case UserRole.BACKOFFICE:
        return "Backoffice";
      case UserRole.ADMIN:
        return "Admin";
      default:
        return role;
    }
  };

  // Embedded mode for Popover
  if (embedded) {
    return (
      <div className="flex flex-col max-h-[400px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Notificacoes</h3>
            {unreadNotifications.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-destructive text-destructive-foreground rounded-full">
                {unreadNotifications.length}
              </span>
            )}
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto">
          {unreadNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground text-sm">Nenhuma notificacao</p>
            </div>
          ) : (
            <div className="divide-y">
              {unreadNotifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    onOpenService(notification.service.id);
                    onClose();
                  }}
                  className="p-3 hover:bg-muted cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-2 mb-1">
                    {getMessageIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {notification.senderName}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {notification.content}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {unreadNotifications.length > 5 && (
          <div className="p-2 border-t text-center">
            <p className="text-xs text-muted-foreground">
              +{unreadNotifications.length - 5} mais notificacoes
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed md:absolute top-16 md:top-full left-4 right-4 md:left-auto md:right-0 md:mt-2 w-auto md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[70vh] md:max-h-[600px] flex flex-col">
        {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">
            Notificações
          </h3>
          {unreadNotifications.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
              {unreadNotifications.length}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Lista de Notificações */}
      <div className="flex-1 overflow-y-auto">
        {unreadNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Nenhuma notificação</p>
            <p className="text-sm text-gray-400 mt-1">
              Você está em dia com todas as comunicações
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {unreadNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => {
                  onOpenService(notification.service.id);
                  onClose();
                }}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {/* Cabeçalho da Notificação */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getMessageIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {notification.senderName}
                      </p>
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(
                          notification.senderRole
                        )}`}
                      >
                        {getRoleLabel(notification.senderRole)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </div>
                </div>

                {/* Processo */}
                <div className="mb-2">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Processo:</span> #{notification.service.id}
                  </p>
                </div>

                {/* Conteúdo da Mensagem */}
                <p className="text-sm text-gray-700 line-clamp-2">
                  {notification.content}
                </p>

                {/* Tipo de Solicitação (se houver) */}
                {notification.requestType && (
                  <div className="mt-2">
                    <span className="inline-block text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded">
                      {notification.requestType === "document" && "📄 Documento"}
                      {notification.requestType === "clarification" && "❓ Esclarecimento"}
                      {notification.requestType === "other" && "💬 Outro"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {unreadNotifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-center text-gray-600">
            Clique em uma notificação para ver o processo completo
          </p>
        </div>
      )}
    </div>
    </>
  );
}
