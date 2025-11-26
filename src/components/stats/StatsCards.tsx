import { Card } from "@/components/ui/card";
import { ServiceStatus } from "@/lib/types";
import { mockServices } from "@/lib/mockData";
import {
  TrendingUp,
  TrendingDown,
  Users,
  FileCheck,
  Clock,
  AlertCircle
} from "lucide-react";

interface StatCard {
  title: string;
  value: number | string;
  description: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
  onClick?: () => void;
}

interface StatsCardsProps {
  onFilterChange?: (statuses: string[]) => void;
  onViewChange?: (view: "dashboard" | "list" | "by-user") => void;
}

export function StatsCards({ onFilterChange, onViewChange }: StatsCardsProps) {
  // Calcular estatísticas
  const totalServices = mockServices.length;

  const waitingApproval = mockServices.filter(
    s => s.status === ServiceStatus.STEP_7_WAITING
  ).length;

  const approved = mockServices.filter(
    s => s.status === ServiceStatus.STEP_7_APPROVED ||
        s.status === ServiceStatus.COMPLETED
  ).length;

  const refused = mockServices.filter(
    s => s.status === ServiceStatus.STEP_7_RECUSED
  ).length;

  const inProgress = mockServices.filter(
    s => s.status?.includes("STEP") &&
        !s.status.includes("COMPLETED") &&
        !s.status.includes("CANCELLED")
  ).length;

  // Taxa de aprovação
  const approvalRate = totalServices > 0
    ? Math.round((approved / totalServices) * 100)
    : 0;

  const stats: StatCard[] = [
    {
      title: "Total de Processos",
      value: totalServices,
      description: "Processos no sistema",
      icon: <Users className="w-5 h-5" />,
      trend: { value: 12, isPositive: true },
      color: "text-blue-600 bg-blue-100",
      onClick: () => {
        onFilterChange?.([]);
        onViewChange?.("list");
      },
    },
    {
      title: "Aguardando Análise",
      value: waitingApproval,
      description: "Precisam de revisão",
      icon: <Clock className="w-5 h-5" />,
      trend: { value: 3, isPositive: false },
      color: "text-yellow-600 bg-yellow-100",
      onClick: () => {
        onFilterChange?.([ServiceStatus.STEP_7_WAITING]);
        onViewChange?.("list");
      },
    },
    {
      title: "Aprovados",
      value: approved,
      description: `Taxa: ${approvalRate}%`,
      icon: <FileCheck className="w-5 h-5" />,
      trend: { value: approvalRate, isPositive: approvalRate > 70 },
      color: "text-green-600 bg-green-100",
      onClick: () => {
        onFilterChange?.([
          ServiceStatus.STEP_7_APPROVED,
          ServiceStatus.STEP_8,
          ServiceStatus.STEP_8_CLIENT_CONFIRMED,
          ServiceStatus.STEP_8_CONFIRMED_BY_GOVERNMENT,
        ]);
        onViewChange?.("list");
      },
    },
    {
      title: "Recusados",
      value: refused,
      description: "Documentação pendente",
      icon: <AlertCircle className="w-5 h-5" />,
      color: "text-red-600 bg-red-100",
      onClick: () => {
        onFilterChange?.([ServiceStatus.STEP_7_RECUSED]);
        onViewChange?.("list");
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={stat.onClick}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                {stat.title}
              </p>
              <p className="text-2xl font-bold mt-2 text-gray-900">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stat.description}
              </p>

              {stat.trend && (
                <div className="flex items-center mt-3">
                  {stat.trend.isPositive ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs font-medium ${
                    stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend.isPositive ? '+' : '-'}{Math.abs(stat.trend.value)}%
                  </span>
                  <span className="text-xs text-gray-500 ml-1">vs mês anterior</span>
                </div>
              )}
            </div>

            <div className={`p-3 rounded-lg ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}