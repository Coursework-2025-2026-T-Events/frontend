import clsx from "clsx";
import Typography from "./Typography";

type Props = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

export default function PageHeader({ title, description, actions, className }: Props) {
  return (
    <div className={clsx("flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div>
        <Typography as="h1" size="xl" weight="bold" className="text-[var(--color-brand-ink)]">
          {title}
        </Typography>
        {description && (
          <Typography className="mt-2 max-w-2xl text-[var(--color-brand-muted)]" size="sm">
            {description}
          </Typography>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
