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

const schema = z.object({
  email: z.string().email("Некорректный адрес электронной почты"),
  password: z.string().min(6, "Минимум 6 символов"),
});

type FormData = z.infer<typeof schema>;

function getErrorField(error: unknown): keyof FormData | null {
  if (!(error instanceof ApiError)) return null;
  if (typeof error.details !== "object" || error.details === null) return null;
  const field = (error.details as { field?: unknown }).field;
  if (field === "email" || field === "password") return field;
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isRegistered] = useState(() =>
    typeof window === "undefined" ? false : new URLSearchParams(window.location.search).get("registered") === "1"
  );
  const [nextPath] = useState(() =>
    typeof window === "undefined" ? "/events" : getSafeRedirectPath(new URLSearchParams(window.location.search).get("next"))
  );
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    setServerError(null);
    try {
      const res = await authApi.login(values);
      tokenStore.setLogoutIntent(false);
      tokenStore.set(res.data.access_token);
      setUser(res.data.user);
      router.push(nextPath);
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        setServerError("Неверная электронная почта или пароль.");
        return;
      }
      const field = getErrorField(e);
      if (field) {
        setError(field, { message: getErrorMessage(e, "Проверьте значение поля") });
        return;
      }
      setServerError(getErrorMessage(e, "Ошибка входа"));
    }
  };

  return (
    <Container>
      <div className="mx-auto mt-10 w-full max-w-md rounded-[var(--radius-lg)] border p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-xl font-bold">Вход</h1>
        <p className="mt-1 text-sm text-neutral-600">Введите адрес электронной почты и пароль</p>

        {isRegistered && (
          <p role="status" className="mt-4 rounded-[var(--radius-md)] border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            Аккаунт создан. Теперь войдите с вашей электронной почтой и паролем.
          </p>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Электронная почта" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
          <div className="relative">
            <Input
              label="Пароль"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="current-password"
              className="pr-12"
              {...register("password")}
              error={errors.password?.message}
            />
            <PasswordVisibilityButton
              isVisible={isPasswordVisible}
              onClick={() => setIsPasswordVisible((value) => !value)}
            />
          </div>

          {serverError && (
            <p role="alert" className="text-sm text-red-600">
              {serverError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            Войти
          </Button>
        </form>
        <Button
          href={authApi.vkStartPath}
          variant="secondary"
          className="mt-3 w-full gap-2"
          reloadDocument
          onClick={() => sessionStorage.setItem(OAUTH_NEXT_PATH_KEY, nextPath)}
        >
          Войти через <VkIcon />
        </Button>
        <p className="mt-4 text-center text-sm text-neutral-600">
          Нет аккаунта?{" "}
          <Link
            className="font-medium text-neutral-900 underline-offset-4 hover:underline"
            href={`/auth/register?next=${encodeURIComponent(nextPath)}`}
          >
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </Container>
  );
}
