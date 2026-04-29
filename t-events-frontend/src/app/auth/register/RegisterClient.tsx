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

const fullNamePattern = /^[\p{L}'-]+ [\p{L}'-]+ ([\p{L}'-]+|-)$/u;
const russianPhonePattern = /^\+7\d{10}$/;
const securityAwareRegistrationError =
  "Не удалось завершить регистрацию. Проверьте данные или попробуйте войти.";

function normalizeRussianPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) return `+7${digits.slice(1)}`;
  if (digits.length === 11 && digits.startsWith("7")) return `+${digits}`;
  if (digits.length === 10) return `+7${digits}`;
  return value.trim();
}

const schema = z.object({
  email: z.string().email("Некорректный адрес электронной почты"),
  password: z.string().min(6, "Минимум 6 символов"),
  full_name: z
    .string()
    .trim()
    .regex(fullNamePattern, "Введите фамилию, имя и отчество. Если отчества нет, укажите '-' третьей частью."),
  phone: z
    .string()
    .min(1, "Введите телефон")
    .transform(normalizeRussianPhone)
    .refine((value) => russianPhonePattern.test(value), "Введите российский номер телефона, например +79991234567"),
});

type RegisterFormData = z.infer<typeof schema>;

function getErrorField(error: unknown): keyof RegisterFormData | null {
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
  } = useForm<RegisterFormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: RegisterFormData) => {
    setServerError(null);
    try {
      const res = await authApi.register(values);
      tokenStore.setLogoutIntent(false);
      tokenStore.set(res.data.access_token);
      setUser(res.data.user);
      router.push(nextPath);
    } catch (error: unknown) {
      if (error instanceof ApiError && (error.status === 409 || error.code === "conflict")) {
        setServerError(securityAwareRegistrationError);
        return;
      }

      const field = getErrorField(error);
      if (field) {
        setError(field, { message: getErrorMessage(error, "Проверьте значение поля") });
        return;
      }

      setServerError(getErrorMessage(error, "Ошибка регистрации"));
    }
  };

  return (
    <AuthPageShell title="Регистрация" description="Создайте аккаунт, чтобы участвовать в играх и получать награды">
      <form className="mt-7 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <AuthField label="Электронная почта" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
        <AuthField
          label="Пароль"
          type={isPasswordVisible ? "text" : "password"}
          autoComplete="new-password"
          className="pr-12"
          {...register("password")}
          error={errors.password?.message}
          endAdornment={<PasswordVisibilityButton isVisible={isPasswordVisible} onClick={() => setIsPasswordVisible((value) => !value)} />}
        />
        <AuthField
          label="ФИО"
          autoComplete="name"
          placeholder="Иванов Иван Иванович или Иванов Иван -"
          {...register("full_name")}
          error={errors.full_name?.message}
        />
        <AuthField label="Телефон" type="tel" autoComplete="tel" {...register("phone")} error={errors.phone?.message} />

        <AuthServerError message={serverError} />
        <AuthPrimaryButton disabled={isSubmitting} label="Создать аккаунт" />
      </form>

      <AuthLegalAndOAuth nextPath={nextPath} />
      <AuthSwitchLink href={`/auth/login?next=${encodeURIComponent(nextPath)}`} label="Войти" prefix="Уже есть аккаунт?" />
    </AuthPageShell>
  );
}

export default function RegisterClient() {
  return (
    <Suspense fallback={null}>
      <RegisterContent />
    </Suspense>
  );
}
