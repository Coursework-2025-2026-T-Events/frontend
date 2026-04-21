import clsx from "clsx";

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "success" | "warning" | "danger";
};

export default function Badge({ variant = "default", className, ...props }: Props) {
  const styles = {
    default: "bg-neutral-100 text-neutral-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}