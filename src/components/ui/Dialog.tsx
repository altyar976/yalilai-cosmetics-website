"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
  closeLabel: string;
  variant?: "center" | "drawer-right" | "drawer-bottom" | "full";
};

/** Accessible modal built on the native <dialog> element (focus trap + Esc handled natively). */
export function Dialog({ open, onClose, label, children, className, closeLabel, variant = "center" }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      document.body.style.overflow = "hidden";
    } else if (!open && d.open) {
      d.close();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={() => {
        document.body.style.overflow = "";
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-0 max-h-none max-w-none bg-transparent p-0 text-ink backdrop:bg-ink/35 backdrop:backdrop-blur-[3px]",
        variant === "center" && "h-full w-full",
        variant === "drawer-right" && "ml-auto h-full w-full max-w-md",
        variant === "drawer-bottom" && "mt-auto w-full",
        variant === "full" && "h-full w-full",
      )}
    >
      <div
        className={cn(
          "relative bg-porcelain",
          variant === "center" && "mx-auto my-[4vh] max-h-[92vh] w-[min(1100px,calc(100%-1.5rem))] overflow-y-auto rounded-[1.75rem]",
          variant === "drawer-right" && "h-full overflow-y-auto",
          variant === "drawer-bottom" && "max-h-[88vh] overflow-y-auto rounded-t-[1.75rem]",
          variant === "full" && "h-full overflow-hidden bg-ink",
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className={cn(
            "absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full transition",
            variant === "full" ? "bg-porcelain/10 text-porcelain hover:bg-porcelain/20" : "bg-porcelain/90 hover:bg-linen",
          )}
        >
          <X className="h-5 w-5" strokeWidth={1.5} />
        </button>
        {open ? children : null}
      </div>
    </dialog>
  );
}
