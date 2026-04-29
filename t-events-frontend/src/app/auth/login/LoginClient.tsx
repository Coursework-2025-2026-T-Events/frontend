"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PasswordVisibilityButton from "@/components/ui/PasswordVisibilityButton";
import { authApi } from "@/features/auth/api";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  AuthField,
  AuthLegalAndOAuth,
  AuthPageShell,
  AuthPrimaryButton,
  AuthServerError,
  AuthSwitchLink,
} from "@/features/auth/AuthFormViews";
import { ApiError } from "@/lib/api/client";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { tokenStore } from "@/lib/auth/tokenStore";
import { getErrorMessage } from "@/lib/getErrorMessage";

const schema = z.object({
  email: z.string().email("Некорректный адрес электронной почты"),
  password: z.string().min(6, "Минимум 6 символов"),
});

type LoginFormData = z.infer<typeof schema>;

function getErrorField(error: unknown): keyof LoginFormData | null {
  if (!(error instanceof ApiError)) return null;
  if (typeof error.details !== "object" || error.details === null) return null;
  const field = (error.details as { field?: unknown }).field;
  if (field === "email" || field === "password") return field;
  return null;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isRegistered = searchParams.get("registered") === "1";
  const nextPath = getSafeRedirectPath(searchParams.get("next"));

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: LoginFormData) => {
    setServerError(null);
    try {
      const res = await authApi.login(values);
      tokenStore.setLogoutIntent(false);
      tokenStore.set(res.data.access_token);
      setUser(res.data.user);
      router.push(nextPath);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.status === 401) {
        setServerError("Неверная электронная почта или пароль.");
        return;
      }

      const field = getErrorField(error);
      if (field) {
        setError(field, { message: getErrorMessage(error, "Проверьте значение поля") });
        return;
      }

      setServerError(getErrorMessage(error, "Ошибка входа"));
    }
  };

  return (
    <AuthPageShell title="Вход" description="Введите почту и пароль, чтобы продолжить участие">
      {isRegistered && (
        <p role="status" className="mt-6 rounded-[var(--radius-md)] bg-[var(--color-brand-panel)] p-4 text-[15px] leading-6 text-[var(--color-brand-graphite)]">
          Аккаунт создан. Теперь войдите с вашей электронной почтой и паролем.
        </p>
      )}

      <form className="mt-7 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <AuthField label="Электронная почта" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
        <AuthField
          label="Пароль"
          type={isPasswordVisible ? "text" : "password"}
          autoComplete="current-password"
          className="pr-12"
          {...register("password")}
          error={errors.password?.message}
          endAdornment={<PasswordVisibilityButton isVisible={isPasswordVisible} onClick={() => setIsPasswordVisible((value) => !value)} />}
        />

        <AuthServerError message={serverError} />
        <AuthPrimaryButton disabled={isSubmitting} label="Войти" />
      </form>

      <AuthLegalAndOAuth nextPath={nextPath} />
      <AuthSwitchLink href={`/auth/register?next=${encodeURIComponent(nextPath)}`} label="Зарегистрироваться" prefix="Нет аккаунта?" />
    </AuthPageShell>
  );
}

export default function LoginClient() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
