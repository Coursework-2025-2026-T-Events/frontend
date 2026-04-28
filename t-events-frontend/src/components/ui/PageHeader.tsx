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
    <div className={clsx("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div>
        <Typography as="h1" size="xl" weight="bold">
          {title}
        </Typography>
        {description && (
          <Typography className="mt-1 text-neutral-600" size="sm">
            {description}
          </Typography>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
