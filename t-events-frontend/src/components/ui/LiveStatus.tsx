import clsx from "clsx";

type Props = {
  children?: React.ReactNode;
  className?: string;
  centered?: boolean;
  busy?: boolean;
};

export default function LiveStatus({ children, className, centered = false, busy = false }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={busy || undefined}
      className={clsx(centered && "flex h-screen w-full items-center justify-center", className)}
    >
      {children}
    </div>
  );
}
