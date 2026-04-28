import { Eye, EyeOff } from "lucide-react";

type Props = {
  isVisible: boolean;
  onClick: () => void;
};

export default function PasswordVisibilityButton({ isVisible, onClick }: Props) {
  const label = isVisible ? "Скрыть пароль" : "Показать пароль";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="absolute right-3 top-[42px] flex h-8 w-8 items-center justify-center rounded text-neutral-600 outline-none hover:bg-neutral-100 hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-[var(--color-brand-black)]"
      onClick={onClick}
    >
      {isVisible ? <EyeOff aria-hidden="true" className="h-5 w-5" /> : <Eye aria-hidden="true" className="h-5 w-5" />}
    </button>
  );
}
