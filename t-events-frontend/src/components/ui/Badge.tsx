import clsx from "clsx";

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "danger";
};

export default function Badge({ variant = "default", className, ...props }: Props) {
  const styles = {
    default: "bg-[var(--color-brand-panel)] text-[var(--color-brand-graphite)]",
    success: "bg-green-100 text-green-800",
    warning: "bg-[var(--color-brand-sand)] text-[var(--color-brand-ink)]",
    danger: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}
