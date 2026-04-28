"use client";

import { Suspense, useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Container from "@/components/ui/Container";
import ConsentNotice from "@/components/auth/ConsentNotice";
import PasswordVisibilityButton from "@/components/ui/PasswordVisibilityButton";
import VkIcon from "@/components/ui/VkIcon";
import { authApi } from "@/features/auth/api";
import { ApiError } from "@/lib/api/client";
import { tokenStore } from "@/lib/auth/tokenStore";
import { OAUTH_NEXT_PATH_KEY, getSafeRedirectPath } from "@/lib/auth/redirect";
import { useAuth } from "@/features/auth/AuthProvider";
import { getErrorMessage } from "@/lib/getErrorMessage";

const fullNamePattern = /^[\p{L}'-]+ [\p{L}'-]+ ([\p{L}'-]+|-)$/u;
const securityAwareRegistrationError =
  "Не удалось завершить регистрацию. Проверьте данные или попробуйте войти.";

const schema = z.object({
  email: z.string().email("Некорректный адрес электронной почты"),
  password: z.string().min(6, "Минимум 6 символов"),
  full_name: z
    .string()
    .trim()
    .regex(fullNamePattern, "Введите фамилию, имя и отчество. Если отчества нет, укажите '-' третьей частью."),
  phone: z.string().min(1, "Введите телефон"),
});

type FormData = z.infer<typeof schema>;

type AuthFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  endAdornment?: React.ReactNode;
};

function AuthField({ label, error, id, className, endAdornment, ...props }: AuthFieldProps) {
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

function getErrorField(error: unknown): keyof FormData | null {
  if (!(error instanceof ApiError)) return null;
  if (typeof error.details !== "object" || error.details === null) return null;
  const field = (error.details as { field?: unknown }).field;
  if (field === "email" || field === "password" || field === "full_name" || field === "phone") return field;
  return null;
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const nextPath = getSafeRedirectPath(searchParams.get("next"));

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    setServerError(null);
    try {
      const res = await authApi.register(values);
      tokenStore.setLogoutIntent(false);
      tokenStore.set(res.data.access_token);
      setUser(res.data.user);
      router.push(nextPath);
    } catch (e: unknown) {
      if (e instanceof ApiError && (e.status === 409 || e.code === "conflict")) {
        setServerError(securityAwareRegistrationError);
        return;
      }
      const field = getErrorField(e);
      if (field) {
        setError(field, { message: getErrorMessage(e, "Проверьте значение поля") });
        return;
      }
      setServerError(getErrorMessage(e, "Ошибка регистрации"));
    }
  };

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
              <h1 className="text-[24px] font-medium leading-7 text-[var(--color-brand-ink)]">Регистрация</h1>
              <p className="mx-auto mt-3 max-w-sm text-[15px] leading-6 text-[var(--color-brand-graphite)]">
                Создайте аккаунт, чтобы участвовать в играх и получать награды
              </p>
            </div>

            <form className="mt-7 space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <AuthField label="Электронная почта" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
              <AuthField
                label="Пароль"
                type={isPasswordVisible ? "text" : "password"}
                autoComplete="new-password"
                className="pr-12"
                {...register("password")}
                error={errors.password?.message}
                endAdornment={
                  <PasswordVisibilityButton
                    isVisible={isPasswordVisible}
                    onClick={() => setIsPasswordVisible((value) => !value)}
                  />
                }
              />
              <AuthField label="ФИО" autoComplete="name" {...register("full_name")} error={errors.full_name?.message} />
              <AuthField label="Телефон" type="tel" autoComplete="tel" {...register("phone")} error={errors.phone?.message} />

              {serverError && (
                <p
                  role="alert"
                  className="rounded-[var(--radius-md)] bg-red-50 p-3 text-[13px] leading-[18px] text-red-700"
                >
                  {serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-brand-yellow)] px-6 py-3 text-[15px] font-normal leading-5 text-[var(--color-brand-ink)] outline-none transition hover:bg-[var(--color-brand-yellow-hover)] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-ink)] disabled:opacity-60"
              >
                Создать аккаунт
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </button>
            </form>

            <ConsentNotice />

            <a
              href={authApi.vkStartPath}
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] px-6 py-3 text-[15px] font-bold leading-6 text-[var(--color-brand-ink)] outline-none transition hover:bg-[#eef0f3] focus-visible:ring-2 focus-visible:ring-[var(--color-brand-yellow)]"
              onClick={() => sessionStorage.setItem(OAUTH_NEXT_PATH_KEY, nextPath)}
            >
              Продолжить с <VkIcon />
            </a>

            <p className="mt-5 text-center text-[15px] leading-6 text-[var(--color-brand-graphite)]">
              Уже есть аккаунт?{" "}
              <Link
                className="text-[#126df7] underline-offset-4 hover:underline"
                href={`/auth/login?next=${encodeURIComponent(nextPath)}`}
              >
                Войти
              </Link>
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}
