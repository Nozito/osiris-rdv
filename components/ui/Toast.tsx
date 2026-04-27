"use client";
// OSIRIS UX — toast notification system (top-right, 4s auto-dismiss, max 3)

import { useCallback, useEffect, useState } from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

/* ── Singleton event bus ───────────────────────────────────── */
type Listener = (item: ToastItem) => void;
const listeners = new Set<Listener>();
let _id = 0;

function emit(type: ToastType, message: string) {
  const item: ToastItem = { id: String(++_id), type, message };
  listeners.forEach((fn) => fn(item));
}

export const toast = {
  success: (msg: string) => emit("success", msg),
  error:   (msg: string) => emit("error", msg),
  info:    (msg: string) => emit("info", msg),
};

/* ── Styling maps ──────────────────────────────────────────── */
const DURATION = 4000;

const borderCls: Record<ToastType, string> = {
  success: "border-l-success",
  error:   "border-l-danger",
  info:    "border-l-accent",
};

const barCls: Record<ToastType, string> = {
  success: "bg-success",
  error:   "bg-danger",
  info:    "bg-accent",
};

const Icon: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={15} className="text-success shrink-0 mt-0.5" />,
  error:   <AlertCircle  size={15} className="text-danger  shrink-0 mt-0.5" />,
  info:    <Info         size={15} className="text-accent  shrink-0 mt-0.5" />,
};

/* ── Single toast card ─────────────────────────────────────── */
function ToastCard({
  item,
  onClose,
}: {
  item: ToastItem;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, DURATION);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`
        relative flex items-start gap-3
        min-w-[280px] max-w-[360px]
        rounded-[14px] border border-white/8 border-l-[3px] ${borderCls[item.type]}
        bg-surface px-4 py-3
        shadow-2xl shadow-black/40
        overflow-hidden
      `}
      style={{ animation: "slideInRight 0.22s ease-out" }}
    >
      {Icon[item.type]}

      <span className="text-sm text-textc leading-snug flex-1 py-0.5">
        {item.message}
      </span>

      <button
        onClick={onClose}
        className="text-faint hover:text-textc transition-colors shrink-0 mt-0.5"
        aria-label="Fermer"
      >
        <X size={13} />
      </button>

      {/* OSIRIS UX — progress bar drains over DURATION */}
      <span
        className={`absolute bottom-0 left-0 h-[2px] ${barCls[item.type]} origin-left`}
        style={{
          animation: `toastProgress ${DURATION}ms linear forwards`,
          width: "100%",
        }}
      />
    </div>
  );
}

/* ── Container rendered in root layout ────────────────────── */
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((item: ToastItem) => {
    setToasts((prev) => [...prev.slice(-2), item]); // keep max 3
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    listeners.add(add);
    return () => { listeners.delete(add); };
  }, [add]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastCard item={t} onClose={() => remove(t.id)} />
        </div>
      ))}
    </div>
  );
}
