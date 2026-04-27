"use client";

import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, icon, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-textc"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-faint">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full h-11 rounded-[10px] bg-surface2 border px-4 text-sm text-textc
              placeholder:text-faint
              transition-colors duration-150
              ${error ? "border-danger/50 focus:border-danger" : "border-white/8 focus:border-accent"}
              focus:outline-none
              ${icon ? "pl-10" : ""}
              ${className}
            `}
            {...props}
          />
        </div>
        {hint && !error && (
          <p className="text-xs text-muted">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-danger">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className = "", id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-textc"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full rounded-[10px] bg-surface2 border px-4 py-3 text-sm text-textc
            placeholder:text-faint resize-none
            transition-colors duration-150
            ${error ? "border-danger/50 focus:border-danger" : "border-white/8 focus:border-accent"}
            focus:outline-none
            ${className}
          `}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-muted">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-danger">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
