import clsx from "clsx";

type Props = React.HTMLAttributes<HTMLDivElement>;

export default function Card({ className, ...props }: Props) {
  return (
    <div
      className={clsx(
        "rounded-[var(--radius-lg)] border border-neutral-200 bg-white p-4 shadow-[var(--shadow-card)]",
        className
      )}
      {...props}
    />
  );
}