"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordVisibilityButton from "@/components/ui/PasswordVisibilityButton";
import VkIcon from "@/components/ui/VkIcon";
import { authApi } from "@/features/auth/api";
import { ApiError } from "@/lib/api/client";
import { tokenStore } from "@/lib/auth/tokenStore";
import { OAUTH_NEXT_PATH_KEY, getSafeRedirectPath } from "@/lib/auth/redirect";
import { useAuth } from "@/features/auth/AuthProvider";
import { getErrorMessage } from "@/lib/getErrorMessage";

const fullNamePattern = /^[\p{L}'-]+ [\p{L}'-]+ ([\p{L}'-]+|-)$/u;
const securityAwareRegistrationError = "Не удалось завершить регистрацию. Проверьте данные или попробуйте войти.";

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

function getErrorField(error: unknown): keyof FormData | null {
  if (!(error instanceof ApiError)) return null;
  if (typeof error.details !== "object" || error.details === null) return null;
  const field = (error.details as { field?: unknown }).field;
  if (field === "email" || field === "password" || field === "full_name" || field === "phone") return field;
  return null;
}

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [nextPath] = useState(() =>
    typeof window === "undefined" ? "/events" : getSafeRedirectPath(new URLSearchParams(window.location.search).get("next"))
  );

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

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
    <Container>
      <div className="mx-auto mt-10 w-full max-w-md rounded-[var(--radius-lg)] border p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-xl font-bold">Регистрация</h1>
        <p className="mt-1 text-sm text-neutral-600">Создайте аккаунт</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Электронная почта" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
          <div className="relative">
            <Input
              label="Пароль"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="new-password"
              className="pr-12"
              {...register("password")}
              error={errors.password?.message}
            />
            <PasswordVisibilityButton
              isVisible={isPasswordVisible}
              onClick={() => setIsPasswordVisible((value) => !value)}
            />
          </div>
          <Input label="ФИО" autoComplete="name" {...register("full_name")} error={errors.full_name?.message} />
          <Input label="Телефон" type="tel" autoComplete="tel" {...register("phone")} error={errors.phone?.message} />

          {serverError && (
            <p role="alert" className="text-sm text-red-600">
              {serverError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            Зарегистрироваться
          </Button>
        </form>
        <Button
          href={authApi.vkStartPath}
          variant="secondary"
          className="mt-3 w-full gap-2"
          reloadDocument
          onClick={() => sessionStorage.setItem(OAUTH_NEXT_PATH_KEY, nextPath)}
        >
          Продолжить через <VkIcon />
        </Button>
        <p className="mt-4 text-center text-sm text-neutral-600">
          Уже есть аккаунт?{" "}
          <Link
            className="font-medium text-neutral-900 underline-offset-4 hover:underline"
            href={`/auth/login?next=${encodeURIComponent(nextPath)}`}
          >
            Войти
          </Link>
        </p>
      </div>
    </Container>
  );
}
