import clsx from "clsx";

type Props = React.HTMLAttributes<HTMLDivElement>;

export default function Card({ className, ...props }: Props) {
  return (
    <div
      className={clsx(
        "rounded-[var(--radius-lg)] border border-[var(--color-brand-line)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6",
        className
      )}
      {...props}
    />
  );
}
