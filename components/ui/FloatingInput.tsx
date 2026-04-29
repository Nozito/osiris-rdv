"use client";
// OSIRIS CRM — input avec label flottant + validation inline

import { useState } from "react";
import { Check, X } from "lucide-react";

interface FloatingInputProps {
  label:       string;
  value:       string;
  onChange:    (v: string) => void;
  type?:       string;
  placeholder?: string;
  validate?:   (v: string) => boolean;
  className?:  string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s\-+().]{7,}$/;

export function FloatingInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  validate,
  className = "",
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);

  const lifted = focused || value.length > 0;

  // Validation après blur uniquement
  let validState: "valid" | "invalid" | null = null;
  if (touched && value.length > 0) {
    if (validate) {
      validState = validate(value) ? "valid" : "invalid";
    } else if (type === "email") {
      validState = EMAIL_RE.test(value) ? "valid" : "invalid";
    } else if (type === "tel") {
      validState = PHONE_RE.test(value) ? "valid" : "invalid";
    }
  }

  return (
    <div className={`relative ${className}`}>
      <label
        className={`
          absolute left-3 pointer-events-none transition-all duration-150 z-10
          ${lifted
            ? "top-1.5 text-[10px] text-accent font-medium"
            : "top-1/2 -translate-y-1/2 text-sm text-faint"
          }
        `}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); setTouched(true); }}
        placeholder={focused ? placeholder : ""}
        className={`
          w-full h-12 px-3 pt-4 pb-1 rounded-[10px]
          bg-surface2 border text-sm text-textc
          outline-none transition-colors
          ${validState === "valid"   ? "border-success/40 focus:border-success/60" :
            validState === "invalid" ? "border-danger/40 focus:border-danger/60"   :
            "border-white/8 focus:border-accent/40"}
          ${validState ? "pr-9" : ""}
        `}
      />
      {validState && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {validState === "valid" ? (
            <Check size={14} className="text-success" />
          ) : (
            <X size={14} className="text-danger" />
          )}
        </div>
      )}
    </div>
  );
}
