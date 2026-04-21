"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { authApi } from "@/features/auth/api";
import { getErrorMessage } from "@/lib/getErrorMessage";

const schema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
  full_name: z.string().min(2, "Введите ФИО"),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    setServerError(null);
    try {
      await authApi.register(values);
      router.push("/auth/login");
    } catch (e: unknown) {
      setServerError(getErrorMessage(e, "Ошибка регистрации"));
    }
  };

  return (
    <Container>
      <div className="mx-auto mt-10 w-full max-w-md rounded-[var(--radius-lg)] border p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-xl font-bold">Регистрация</h1>
        <p className="mt-1 text-sm text-neutral-600">Создайте аккаунт</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
          <Input label="Пароль" type="password" {...register("password")} error={errors.password?.message} />
          <Input label="ФИО" {...register("full_name")} error={errors.full_name?.message} />
          <Input label="Телефон (опционально)" {...register("phone")} />

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            Зарегистрироваться
          </Button>
        </form>
      </div>
    </Container>
  );
}