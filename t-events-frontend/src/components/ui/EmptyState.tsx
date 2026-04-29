import clsx from "clsx";
import Button from "./Button";
import Card from "./Card";
import Typography from "./Typography";

type Props = {
  title: string;
  description?: string | undefined;
  actionLabel?: string | undefined;
  actionHref?: string | undefined;
  onAction?: (() => void) | undefined;
  className?: string | undefined;
};

export default function EmptyState({ title, description, actionLabel, actionHref, onAction, className }: Props) {
  return (
    <Card className={clsx("text-left", className)}>
      <Typography as="h2" size="lg" weight="bold">
        {title}
      </Typography>
      {description && (
        <Typography className="mt-2 text-neutral-600" size="sm">
          {description}
        </Typography>
      )}
      {actionLabel && actionHref && <Button className="mt-4" href={actionHref}>{actionLabel}</Button>}
      {actionLabel && !actionHref && onAction && (
        <Button className="mt-4" type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}
