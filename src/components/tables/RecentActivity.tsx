"use client";

import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/pedidos/status-badge";
import { mockServices } from "@/lib/mockData";
import { ServiceWithRelations } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User, FileText, ArrowRight } from "lucide-react";

interface RecentActivityProps {
  onServiceClick?: (service: ServiceWithRelations) => void;
  onViewAllClick?: () => void;
}

export function RecentActivity({ onServiceClick, onViewAllClick }: RecentActivityProps) {

  // Pegar os 5 processos mais recentes ou com atualizações recentes
  const recentServices = mockServices
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  const getActivityDescription = (service: any) => {
    if (service.status === "Passo 7 Esperando") {
      return "Aguardando análise do advogado";
    } else if (service.status === "Passo 7 Aprovado") {
      return "Processo aprovado pelo advogado";
    } else if (service.status === "Passo 7 Recusado") {
      return "Processo recusado - documentação pendente";
    } else if (service.status === "Passo 8") {
      return "Aguardando pagamento ao governo";
    } else if (service.status === "Concluído") {
      return "Processo finalizado com sucesso";
    } else if (service.status?.includes("Passo")) {
      return `Em progresso - ${service.status}`;
    }
    return "Atualização no processo";
  };

  const getActivityIcon = (status: string) => {
    if (status?.includes("Aprovado") || status === "Concluído") {
      return "✅";
    } else if (status?.includes("Recusado")) {
      return "❌";
    } else if (status?.includes("Esperando")) {
      return "⏳";
    } else if (status?.includes("Passo 8")) {
      return "💳";
    }
    return "📋";
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Atividade Recente
          </h3>
          <p className="text-sm text-gray-500">Últimas atualizações</p>
        </div>
        <button
          onClick={onViewAllClick}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          Ver todos
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {recentServices.map((service) => {
          const timeAgo = formatDistanceToNow(
            new Date(service.updatedAt || service.createdAt),
            { addSuffix: true, locale: ptBR }
          );

          return (
            <div
              key={service.id}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onServiceClick?.(service as ServiceWithRelations)}
            >
              {/* Ícone */}
              <div className="text-2xl mt-1">
                {getActivityIcon(service.status || "")}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {service.user?.fullName || 'N/A'}
                  </p>
                  <StatusBadge status={service.status} />
                </div>

                <p className="text-sm text-gray-600">
                  {getActivityDescription(service)}
                </p>

                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {timeAgo}
                  </div>

                  {service.processNumber && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <FileText className="w-3 h-3" />
                      {service.processNumber}
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    ID: {service.id.slice(0, 6)}
                  </div>
                </div>
              </div>

              {/* Indicador de ação */}
              {service.status === "Passo 7 Esperando" && (
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Ação necessária
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {recentServices.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhuma atividade recente</p>
        </div>
      )}
    </Card>
  );
}