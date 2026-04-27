interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "success" | "warning" | "danger" | "muted";
  size?: "sm" | "md";
  dot?: boolean;
}

const variants = {
  default: "bg-white/8 text-textc border-white/10",
  accent: "bg-accent/15 text-accent border-accent/25",
  success: "bg-success/15 text-success border-success/25",
  warning: "bg-warning/15 text-warning border-warning/25",
  danger: "bg-danger/15 text-danger border-danger/25",
  muted: "bg-surface2 text-muted border-white/8",
};

const dotColors = {
  default: "bg-textc",
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  muted: "bg-muted",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  dot = false,
}: BadgeProps) {
  return (
    // OSIRIS UX — subtle scale + dot pulse on hover
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium
        group cursor-default select-none
        transition-transform duration-200 hover:scale-[1.05]
        ${variants[variant]}
        ${size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1"}
      `}
    >
      {dot && (
        <span
          className={`
            w-1.5 h-1.5 rounded-full shrink-0
            transition-opacity duration-200
            group-hover:animate-pulse
            ${dotColors[variant]}
          `}
        />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { label: string; variant: BadgeProps["variant"] }
  > = {
    draft: { label: "Brouillon", variant: "muted" },
    sent: { label: "Envoyé", variant: "accent" },
    signed: { label: "Signé", variant: "success" },
    lost: { label: "Perdu", variant: "danger" },
  };

  const config = map[status] ?? { label: status, variant: "default" };

  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}
