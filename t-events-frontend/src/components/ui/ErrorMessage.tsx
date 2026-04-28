import clsx from "clsx";
import Button from "./Button";
import { uiMessages } from "@/lib/messages";

type Props = {
  message: string;
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export default function ErrorMessage({ message, title = uiMessages.defaultErrorTitle, actionLabel, onAction, className }: Props) {
  return (
    <div
      role="alert"
      className={clsx(
        "rounded-[var(--radius-md)] border border-red-200 bg-red-50 p-4 text-sm text-red-800",
        className
      )}
    >
      <div className="font-medium">{title}</div>
      <div className="mt-1">{message}</div>
      {actionLabel && onAction && (
        <Button className="mt-3" variant="secondary" type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
