// OSIRIS CRM — score de lead automatique (0–100)
import type { ConfiguratorData } from "@/types";

export function calcLeadScore(data: Partial<ConfiguratorData>, totalTTC: number): number {
  let score = 0;

  if (totalTTC >= 2000)      score += 30;
  else if (totalTTC >= 1000) score += 15;

  if (data.clientCurrentSite === "yes-old" || data.clientCurrentSite === "refonte") score += 20;

  if ((data.clientObjectives?.length ?? 0) >= 2) score += 15;

  if (data.clientEmail)  score += 10;
  if (data.clientPhone)  score += 5;

  if (["2-10", "11-50", "51-200", "200+"].includes(data.clientCompanySize ?? "")) score += 10;

  if (data.clientBudgetRange === "flexible")                               score -= 10;
  if (data.clientBudgetRange === "under-1k" && totalTTC > 1500)           score -= 20;

  return Math.max(0, Math.min(100, score));
}

export function leadScoreColor(score: number): string {
  if (score >= 71) return "text-success bg-success/10 border-success/20";
  if (score >= 41) return "text-amber-400 bg-amber-400/10 border-amber-400/20";
  return "text-danger bg-danger/10 border-danger/20";
}
