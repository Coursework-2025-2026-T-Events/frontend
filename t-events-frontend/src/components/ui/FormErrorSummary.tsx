import clsx from "clsx";

export type FormErrorSummaryItem = {
  label: string;
  message: string;
  fieldId?: string | undefined;
};

type Props = {
  items: FormErrorSummaryItem[];
  title?: string | undefined;
  className?: string | undefined;
};

export default function FormErrorSummary({ items, title = "Проверьте поля формы", className }: Props) {
  if (items.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={clsx("rounded-[var(--radius-md)] border border-red-200 bg-red-50 p-4 text-sm text-red-800", className)}
    >
      <div className="font-medium">{title}</div>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {items.map((item) => (
          <li key={`${item.label}-${item.message}`}>
            {item.fieldId ? (
              <a className="underline underline-offset-2" href={`#${item.fieldId}`}>
                {item.label}: {item.message}
              </a>
            ) : (
              <span>
                {item.label}: {item.message}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
