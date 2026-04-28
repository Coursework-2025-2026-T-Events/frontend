import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ErrorMessage from "@/components/ui/ErrorMessage";
import Typography from "@/components/ui/Typography";
import { getErrorMessage } from "@/lib/getErrorMessage";

type Props = {
  isArchived: boolean;
  isPending: boolean;
  error: unknown;
  onArchive: () => void;
};

export default function ArchivePanel({ isArchived, isPending, error, onArchive }: Props) {
  return (
    <Card>
      <Typography as="h2" size="lg" weight="bold">
        Архив
      </Typography>
      <Typography className="mt-2 text-neutral-600" size="sm">
        Архивирование необратимо. Архивные мероприятия остаются видимыми в админском списке.
      </Typography>
      <Button className="mt-4" variant="danger" onClick={onArchive} disabled={isArchived || isPending}>
        {isPending ? "Архивирование..." : "Архивировать"}
      </Button>
      {error !== null && error !== undefined && (
        <ErrorMessage className="mt-3" message={getErrorMessage(error, "Не удалось архивировать мероприятие")} />
      )}
    </Card>
  );
}
