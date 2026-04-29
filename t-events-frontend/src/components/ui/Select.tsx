import clsx from "clsx";
import { useId } from "react";

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string | undefined;
  error?: string | undefined;
};

export default function Select({ label, error, className, id, children, ...props }: Props) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;

  return (
    <label className="block" htmlFor={selectId}>
      {label && <span className="mb-1.5 block text-sm font-semibold text-[var(--color-brand-graphite)]">{label}</span>}
      <select
        {...props}
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : props["aria-describedby"]}
        className={clsx(
          "h-12 w-full rounded-[var(--radius-md)] border border-[var(--color-brand-line)] bg-white px-4 text-sm outline-none transition-colors focus:border-[var(--color-brand-black)] disabled:bg-neutral-50 disabled:text-neutral-500",
          className
        )}
      >
        {children}
      </select>
      {error && (
        <span id={errorId} role="alert" className="mt-1 block text-xs text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}
