import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status: string | null): string {
  if (!status) return "gray";

  // Passos iniciais (1-6)
  if (status.startsWith("Passo") && !status.includes("7") && !status.includes("8")) {
    return "blue";
  }

  // Passo 7 variants
  if (status === "Passo 7 Esperando") return "yellow";
  if (status === "Passo 7 Aprovado") return "green";
  if (status === "Passo 7 Recusado") return "red";
  if (status === "Passo 7 Quase") return "orange";

  // Passo 8 variants
  if (status.includes("Passo 8")) return "purple";

  // Status finais
  if (status === "Submetido") return "indigo";
  if (status === "Em análise") return "cyan";
  if (status === "Aguarda resposta") return "teal";
  if (status === "Para decisão") return "violet";
  if (status === "Concluído") return "green";
  if (status === "Cancelado") return "red";

  return "gray";
}
