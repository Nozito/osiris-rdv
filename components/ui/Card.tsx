interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

export function Card({ children, className = "", glow = false }: CardProps) {
  return (
    <div
      className={`
        relative rounded-card bg-surface border border-white/8 p-6
        ${glow ? "shadow-[0_0_40px_var(--glow)]" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function CardHeader({ title, description, icon }: CardHeaderProps) {
  return (
    <div className="flex items-start gap-3 mb-6">
      {icon && (
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
          {icon}
        </div>
      )}
      <div>
        <h2 className="text-lg font-semibold text-textc font-display">{title}</h2>
        {description && (
          <p className="text-sm text-muted mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}
