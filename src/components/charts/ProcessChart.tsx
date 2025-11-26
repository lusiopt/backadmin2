"use client";

import { Card } from "@/components/ui/card";
import { mockServices } from "@/lib/mockData";
import { ServiceStatus } from "@/lib/types";
import { useMemo } from "react";

interface ProcessChartProps {
  onFilterChange?: (statuses: string[]) => void;
  onViewChange?: (view: "dashboard" | "list" | "by-user") => void;
}

export function ProcessChart({ onFilterChange, onViewChange }: ProcessChartProps) {
  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>();

    // Agrupar status similares
    const statusGroups = {
      "Documentação": [
        ServiceStatus.STEP_1,
        ServiceStatus.STEP_2,
        ServiceStatus.STEP_3,
        ServiceStatus.STEP_4,
        ServiceStatus.STEP_5,
        ServiceStatus.STEP_6,
      ],
      "Análise Advogado": [
        ServiceStatus.STEP_7,
        ServiceStatus.STEP_7_WAITING,
        ServiceStatus.STEP_7_ALMOST,
      ],
      "Aprovados": [
        ServiceStatus.STEP_7_APPROVED,
        ServiceStatus.STEP_8,
        ServiceStatus.STEP_8_CLIENT_CONFIRMED,
        ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT,
      ],
      "Recusados": [ServiceStatus.STEP_7_RECUSED],
      "Governo": [
        ServiceStatus.SUBMITTED,
        ServiceStatus.UNDER_ANALYSIS,
        ServiceStatus.WAITING_RESPONSE,
        ServiceStatus.FOR_DECISION,
      ],
      "Concluídos": [ServiceStatus.COMPLETED],
    };

    // Contar por grupo
    Object.entries(statusGroups).forEach(([group, statuses]) => {
      const count = mockServices.filter(s =>
        statuses.includes(s.status as ServiceStatus)
      ).length;
      if (count > 0) {
        counts.set(group, count);
      }
    });

    return counts;
  }, []);

  const total = mockServices.length;

  const colors = {
    "Documentação": "bg-blue-500",
    "Análise Advogado": "bg-yellow-500",
    "Aprovados": "bg-green-500",
    "Recusados": "bg-red-500",
    "Governo": "bg-purple-500",
    "Concluídos": "bg-gray-500",
  };

  const statusGroups = {
    "Documentação": [
      ServiceStatus.STEP_1,
      ServiceStatus.STEP_2,
      ServiceStatus.STEP_3,
      ServiceStatus.STEP_4,
      ServiceStatus.STEP_5,
      ServiceStatus.STEP_6,
    ],
    "Análise Advogado": [
      ServiceStatus.STEP_7,
      ServiceStatus.STEP_7_WAITING,
      ServiceStatus.STEP_7_ALMOST,
    ],
    "Aprovados": [
      ServiceStatus.STEP_7_APPROVED,
      ServiceStatus.STEP_8,
      ServiceStatus.STEP_8_CLIENT_CONFIRMED,
      ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT,
    ],
    "Recusados": [ServiceStatus.STEP_7_RECUSED],
    "Governo": [
      ServiceStatus.SUBMITTED,
      ServiceStatus.UNDER_ANALYSIS,
      ServiceStatus.WAITING_RESPONSE,
      ServiceStatus.FOR_DECISION,
    ],
    "Concluídos": [ServiceStatus.COMPLETED],
  };

  const handleGroupClick = (groupName: string) => {
    const statuses = statusGroups[groupName as keyof typeof statusGroups];
    if (statuses && onFilterChange && onViewChange) {
      onFilterChange(statuses);
      onViewChange("list");
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Distribuição de Processos
        </h3>
        <p className="text-sm text-gray-500">Por fase do processo</p>
      </div>

      {/* Barra de progresso empilhada */}
      <div className="w-full bg-gray-200 rounded-full h-8 mb-6 flex overflow-hidden">
        {Array.from(statusCounts.entries()).map(([status, count]) => {
          const percentage = (count / total) * 100;
          return (
            <div
              key={status}
              className={`${colors[status as keyof typeof colors]} relative group cursor-pointer transition-all hover:opacity-80`}
              style={{ width: `${percentage}%` }}
              title={`${status}: ${count} (${percentage.toFixed(1)}%)`}
              onClick={() => handleGroupClick(status)}
            >
              {percentage > 5 && (
                <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from(statusCounts.entries()).map(([status, count]) => {
          const percentage = (count / total) * 100;
          return (
            <div
              key={status}
              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              onClick={() => handleGroupClick(status)}
            >
              <div
                className={`w-3 h-3 rounded ${colors[status as keyof typeof colors]}`}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">{status}</p>
                <p className="text-xs text-gray-500">
                  {count} ({percentage.toFixed(1)}%)
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {statusCounts.get("Aprovados") || 0}
            </p>
            <p className="text-xs text-gray-500">Aprovados</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">
              {statusCounts.get("Análise Advogado") || 0}
            </p>
            <p className="text-xs text-gray-500">Em Análise</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-600">
              {statusCounts.get("Concluídos") || 0}
            </p>
            <p className="text-xs text-gray-500">Concluídos</p>
          </div>
        </div>
      </div>
    </Card>
  );
}