"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconRight,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40 disabled:cursor-not-allowed select-none";

    const variants = {
      primary:
        "bg-accent hover:bg-accent-hover text-white active:scale-[0.98]",
      secondary:
        "bg-surface2 hover:bg-white/[0.06] text-textc border border-white/8 active:scale-[0.98]",
      ghost:
        "bg-transparent hover:bg-white/[0.05] text-muted hover:text-textc active:scale-[0.98]",
      danger:
        "bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 active:scale-[0.98]",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm rounded-[10px]",
      md: "h-10 px-4 text-sm rounded-btn",
      lg: "h-12 px-6 text-base rounded-btn",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        {children}
        {iconRight && !loading && (
          <span className="shrink-0">{iconRight}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
