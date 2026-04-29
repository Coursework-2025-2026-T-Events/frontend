"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import ConsentNotice from "@/components/auth/ConsentNotice";
import VkIcon from "@/components/ui/VkIcon";
import { authApi } from "@/features/auth/api";
import { OAUTH_NEXT_PATH_KEY } from "@/lib/auth/redirect";

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | undefined;
  endAdornment?: ReactNode | undefined;
};

export function AuthField({ label, error, id, className, endAdornment, ...props }: AuthFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-2 block text-[13px] leading-[18px] text-[var(--color-brand-graphite)]">{label}</span>
      <div className="relative">
        <input
          {...props}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : props["aria-describedby"]}
          className={[
            "h-14 w-full rounded-[var(--radius-md)] border border-[var(--color-brand-line)] bg-white px-4 text-[15px] leading-5 text-[var(--color-brand-ink)] outline-none transition-colors placeholder:text-[var(--color-brand-muted)] focus:border-[var(--color-brand-ink)] disabled:bg-[var(--color-brand-panel)]",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        />
        {endAdornment && <div className="absolute right-3 top-1/2 -translate-y-1/2">{endAdornment}</div>}
      </div>
      {error && (
        <span id={errorId} role="alert" className="mt-1.5 block text-[13px] leading-[18px] text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

export function AuthPageShell({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[var(--color-brand-mist)]">
      <Image
        src="/images/auth-background.png"
        alt=""
        fill
        sizes="100vw"
        priority
        unoptimized
        className="pointer-events-none hidden object-cover lg:block"
        aria-hidden
      />

      <Container>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
          <section className="relative z-10 w-full max-w-[560px] rounded-[24px] bg-white p-6 sm:p-10">
            <div className="text-center">
              <h1 className="text-[24px] font-medium leading-7 text-[var(--color-brand-ink)]">{title}</h1>
              <p className="mx-auto mt-3 max-w-sm text-[15px] leading-6 text-[var(--color-brand-graphite)]">{description}</p>
            </div>
            {children}
          </section>
        </div>
      </Container>
    </div>
  );
}

export function AuthServerError({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <p role="alert" className="rounded-[var(--radius-md)] bg-red-50 p-3 text-[13px] leading-[18px] text-red-700">
      {message}
    </p>
  );
}

export function AuthPrimaryButton({ disabled, label }: { disabled: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-yellow)] px-6 py-3 text-[15px] font-normal leading-5 text-[var(--color-brand-ink)] outline-none transition hover:bg-[var(--color-brand-yellow-hover)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-ink)] disabled:opacity-60"
    >
      {label}
      <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
    </button>
  );
}

export function AuthVkButton({ nextPath }: { nextPath: string }) {
  return (
    <a
      href={authApi.vkStartPath}
      className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] px-6 py-3 text-[15px] font-bold leading-6 text-[var(--color-brand-ink)] outline-none transition hover:bg-[#eef0f3] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]"
      onClick={() => sessionStorage.setItem(OAUTH_NEXT_PATH_KEY, nextPath)}
    >
      Войти через <VkIcon />
    </a>
  );
}

export function AuthLegalAndOAuth({ nextPath }: { nextPath: string }) {
  return (
    <>
      <ConsentNotice />
      <AuthVkButton nextPath={nextPath} />
    </>
  );
}

export function AuthSwitchLink({
  href,
  label,
  prefix,
}: {
  href: string;
  label: string;
  prefix: string;
}) {
  return (
    <p className="mt-5 text-center text-[15px] leading-6 text-[var(--color-brand-graphite)]">
      {prefix}{" "}
      <Link className="text-[#126df7] underline-offset-4 hover:underline" href={href}>
        {label}
      </Link>
    </p>
  );
}
