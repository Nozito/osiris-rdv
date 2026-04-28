"use client";

import { motion } from "framer-motion";
import { formatPrice } from "@/lib/pricing";

interface StageData {
  label:  string;
  count:  number;
  value:  number;
  color:  string;
  track:  string;
}

interface Props {
  draft:  { count: number; value: number };
  sent:   { count: number; value: number };
  signed: { count: number; value: number };
  lost:   { count: number; value: number };
}

export function LeadPipeline({ draft, sent, signed, lost }: Props) {
  const total = draft.count + sent.count + signed.count + lost.count;
  if (total === 0) return null;

  const stages: StageData[] = [
    { label: "Brouillons", ...draft,  color: "bg-faint",   track: "bg-faint/15"   },
    { label: "Envoyés",    ...sent,   color: "bg-accent",  track: "bg-accent/15"  },
    { label: "Signés",     ...signed, color: "bg-success", track: "bg-success/15" },
    { label: "Perdus",     ...lost,   color: "bg-danger",  track: "bg-danger/15"  },
  ];

  return (
    <div className="rounded-card bg-surface border border-white/8 p-4 mb-5">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
        Pipeline
      </p>

      <div className="flex flex-col gap-3">
        {stages.map((stage) => {
          const pct = total > 0 ? (stage.count / total) * 100 : 0;
          return (
            <div key={stage.label} className="flex items-center gap-3">
              {/* Label */}
              <span className="text-xs text-muted w-20 shrink-0">{stage.label}</span>

              {/* Barre */}
              <div className={`flex-1 h-2 rounded-full ${stage.track} overflow-hidden`}>
                <motion.div
                  className={`h-full rounded-full ${stage.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                />
              </div>

              {/* Count */}
              <span className="text-xs font-semibold text-textc w-5 text-right shrink-0">
                {stage.count}
              </span>

              {/* Valeur */}
              <span className="text-xs text-muted w-24 text-right shrink-0 hidden sm:block">
                {stage.value > 0 ? formatPrice(stage.value) : "—"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Totaux rapides */}
      <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between text-xs text-muted">
        <span>{total} lead{total > 1 ? "s" : ""} au total</span>
        {signed.value > 0 && (
          <span className="text-success font-semibold">
            {formatPrice(signed.value)} signés
          </span>
        )}
      </div>
    </div>
  );
}
