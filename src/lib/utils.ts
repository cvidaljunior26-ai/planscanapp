import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(date));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function calculateXP(params: { hasPhoto: boolean; hasPriceResearch: boolean; conformity: boolean }) {
  const breakdown: Record<string, number> = { "Gondola executada": 10 };
  if (params.hasPhoto) breakdown["Foto de evidencia"] = 3;
  if (params.hasPriceResearch) breakdown["Pesquisa de preco"] = 5;
  if (params.conformity) breakdown["Conformidade OK"] = 2;
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return { breakdown, total };
}
