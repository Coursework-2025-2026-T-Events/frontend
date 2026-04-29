"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Typography from "@/components/ui/Typography";

export type ConfirmDialogState =
  | {
      title: string;
      message: string;
      confirmLabel: string;
      tone?: "danger" | "primary";
      onConfirm: () => void;
    }
  | null;

type ConfirmationDialogProps = {
  state: ConfirmDialogState;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmationDialog({ state, onCancel, onConfirm }: ConfirmationDialogProps) {
  useEffect(() => {
    if (!state) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    };

    const previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.getElementById("admin-confirm-cancel")?.focus();
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus();
    };
  }, [onCancel, state]);

  if (!state) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(16,17,20,0.48)] px-4" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        className="w-full max-w-[440px] rounded-[var(--radius-lg)] bg-white p-5 shadow-[0_24px_60px_rgba(16,17,20,0.22)] sm:p-6"
      >
        <Typography id="admin-confirm-title" as="h2" size="lg" weight="bold">
          {state.title}
        </Typography>
        <Typography className="mt-2 text-neutral-600" size="sm">
          {state.message}
        </Typography>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button id="admin-confirm-cancel" type="button" variant="secondary" onClick={onCancel}>
            Отменить
          </Button>
          <Button type="button" variant={state.tone === "danger" ? "danger" : "primary"} onClick={onConfirm}>
            {state.confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}
