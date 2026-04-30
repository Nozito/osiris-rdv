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
    <div className="rounded-card bg-surface border border-white/8 p-4 h-full">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
        Pipeline
      </p>

      <div className="flex flex-col gap-3">
        {stages.map((stage) => {
          const pct = total > 0 ? (stage.count / total) * 100 : 0;
          return (
            <div key={stage.label} className="flex items-center gap-2">
              {/* Label — tronqué si trop long */}
              <span className="text-xs text-muted w-16 shrink-0 truncate">{stage.label}</span>

              {/* Barre */}
              <div className={`flex-1 h-2 rounded-full ${stage.track} overflow-hidden min-w-0`}>
                <motion.div
                  className={`h-full rounded-full ${stage.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.55, ease: "easeOut", delay: 0.05 }}
                />
              </div>

              {/* Count */}
              <span className="text-xs font-semibold text-textc w-4 text-right shrink-0">
                {stage.count}
              </span>

              {/* Valeur — masquée sur mobile */}
              <span className="text-xs text-muted w-20 text-right shrink-0 hidden sm:block tabular-nums">
                {stage.value > 0 ? formatPrice(stage.value) : "—"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Totaux */}
      <div className="mt-4 pt-3 border-t border-white/8 flex items-center justify-between text-xs text-muted">
        <span>{total} lead{total > 1 ? "s" : ""}</span>
        {signed.value > 0 && (
          <span className="text-success font-semibold tabular-nums">
            {formatPrice(signed.value)} signés
          </span>
        )}
      </div>
    </div>
  );
}
