import Link from "next/link";
import { Info, X } from "lucide-react";

const privacyUrl = "https://cdn.tbank.ru/static/documents/personal-data-processing-policy-of-t-education.pdf";

export default function ConsentNotice() {
  return (
    <>
      <div className="mt-3 flex gap-3 rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] p-4 text-[15px] leading-6 text-[var(--color-brand-graphite)]">
        <Info className="mt-0.5 h-5 w-5 flex-none text-[var(--color-brand-muted)]" aria-hidden />
        <p>
          Продолжая, вы соглашаетесь с{" "}
          <a
            href="#transfer-terms"
            className="text-left text-[#126df7] underline-offset-4 hover:underline"
          >
            условиями передачи
          </a>{" "}
          и{" "}
          <Link className="text-[#126df7] underline-offset-4 hover:underline" href={privacyUrl} target="_blank" rel="noreferrer">
            политикой обработки персональных данных
          </Link>
        </p>
      </div>

      <div
        id="transfer-terms"
        className="fixed inset-0 z-[80] hidden items-center justify-center bg-black/40 px-4 py-8 target:flex"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-dialog-title"
      >
        <div className="max-h-full w-full max-w-2xl overflow-auto rounded-[24px] bg-white p-6 shadow-[0_24px_72px_rgba(16,17,20,0.22)] sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[13px] leading-[18px] text-[var(--color-brand-muted)]">Правовой документ</p>
              <h2 id="terms-dialog-title" className="mt-2 text-[24px] font-medium leading-7 text-[var(--color-brand-ink)]">
                Условия передачи информации
              </h2>
            </div>
            <a
              href="#"
              className="flex h-9 w-9 flex-none items-center justify-center rounded-[var(--radius-md)] text-[var(--color-brand-muted)] outline-none hover:bg-[var(--color-brand-panel)] hover:text-[var(--color-brand-ink)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" aria-hidden />
            </a>
          </div>

          <div className="mt-6 space-y-4 text-[15px] leading-6 text-[var(--color-brand-graphite)]">
            <p>
              Я даю согласие АНО ДПО «Т-Образование» и АО «ТБанк» на обработку моих персональных данных,
              предоставленных при регистрации и использовании сервиса.
            </p>
            <p>
              Обработка может включать сбор, запись, систематизацию, хранение, уточнение, использование, передачу,
              обезличивание, блокирование, удаление и уничтожение данных.
            </p>
            <p>
              Данные могут использоваться для предоставления образовательных сервисов, участия в мероприятиях,
              начисления баллов, выдачи наград и выполнения связанных с этим действий.
            </p>
            <p>
              Для достижения этих целей данные могут передаваться аффилированным лицам и контрагентам, участвующим в
              работе сервиса и его технической поддержке.
            </p>
          </div>

          <a
            href="#"
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-yellow)] px-6 py-3 text-[15px] font-normal leading-5 text-[var(--color-brand-ink)] transition hover:bg-[var(--color-brand-yellow-hover)]"
          >
            Понятно
          </a>
        </div>
      </div>
    </>
  );
}
