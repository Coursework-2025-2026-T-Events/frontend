import clsx from "clsx";
import LiveStatus from "./LiveStatus";
import { uiMessages } from "@/lib/messages";

type Props = {
  message?: string;
  className?: string;
};

export default function LoadingState({ message = uiMessages.loading, className }: Props) {
  return (
    <LiveStatus className={clsx("text-sm text-neutral-600", className)} busy>
      <span className="inline-flex items-center gap-2">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-[var(--color-brand-yellow)]" />
        {message}
      </span>
    </LiveStatus>
  );
}
