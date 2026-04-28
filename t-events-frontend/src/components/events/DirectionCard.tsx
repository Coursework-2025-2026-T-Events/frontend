"use client";

import clsx from "clsx";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { DirectionDTO } from "@/lib/api/types";
import { getDirectionTheme } from "./directionTheme";
import { DirectionVisual } from "./directionVisuals";

export type DirectionCardProps = {
  direction: Pick<DirectionDTO, "direction_id" | "name">;
  selected?: boolean;
  onOpen: () => void;
  className?: string;
  actionLabel?: string;
  selectedActionLabel?: string;
};

const cardBaseClassName = [
  "group flex min-h-[348px] flex-col overflow-hidden rounded-[var(--radius-lg)] bg-white text-left shadow-[var(--shadow-card)] outline-none transition",
  "hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]",
].join(" ");

export function DirectionCard({
  direction,
  selected = false,
  onOpen,
  className,
  actionLabel = "Выбрать направление",
  selectedActionLabel = "Продолжить игры",
}: DirectionCardProps) {
  const theme = getDirectionTheme(direction.name);

  return (
    <button
      type="button"
      onClick={onOpen}
      className={clsx(cardBaseClassName, selected && "ring-2 ring-[var(--color-brand-yellow)]", className)}
    >
      <DirectionVisual theme={theme} selected={selected} />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-[21px] font-medium leading-7 text-[var(--color-brand-ink)]">{direction.name}</h2>
          {selected && (
            <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[var(--color-brand-yellow)] text-[var(--color-brand-ink)]">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
            </span>
          )}
        </div>

        <p className="mt-3 text-[15px] leading-6 text-[var(--color-brand-graphite)]">{theme.description}</p>

        <div className="mt-auto pt-6">
          <span className="inline-flex items-center text-[15px] font-medium leading-5 text-[#126df7]">
            {selected ? selectedActionLabel : actionLabel}
            <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </div>
    </button>
  );
}

export function DirectionSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-card)]" aria-hidden>
      <div className="h-40 bg-[#edf0f4]" />
      <div className="p-5">
        <div className="h-7 w-3/5 rounded bg-[#edf0f4]" />
        <div className="mt-4 space-y-2">
          <div className="h-4 rounded bg-[#edf0f4]" />
          <div className="h-4 w-4/5 rounded bg-[#edf0f4]" />
        </div>
        <div className="mt-10 h-5 w-36 rounded bg-[#edf0f4]" />
      </div>
    </div>
  );
}
