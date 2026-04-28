import clsx from "clsx";
import { useId } from "react";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export default function Textarea({ label, error, className, id, ...props }: Props) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;

  return (
    <label className="block" htmlFor={textareaId}>
      {label && <span className="mb-1.5 block text-sm font-semibold text-[var(--color-brand-graphite)]">{label}</span>}
      <textarea
        {...props}
        id={textareaId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : props["aria-describedby"]}
        className={clsx(
          "min-h-28 w-full rounded-[var(--radius-md)] border border-[var(--color-brand-line)] bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-[var(--color-brand-black)] disabled:bg-neutral-50 disabled:text-neutral-500",
          className
        )}
      />
      {error && (
        <span id={errorId} role="alert" className="mt-1 block text-xs text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}
