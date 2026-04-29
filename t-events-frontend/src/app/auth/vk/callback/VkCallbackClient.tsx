"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { authApi } from "@/features/auth/api";
import { useAuth } from "@/features/auth/AuthProvider";
import type { UserDTO } from "@/lib/api/types";
import { OAUTH_NEXT_PATH_KEY, getSafeRedirectPath } from "@/lib/auth/redirect";
import { tokenStore } from "@/lib/auth/tokenStore";
import { getErrorMessage } from "@/lib/getErrorMessage";

type VkAuthPayload = {
  access_token: string;
  user: UserDTO;
};

function getVkCallbackErrorMessage(errorCode: string): string {
  if (errorCode === "service_unavailable") return "Вход через VK временно не настроен.";
  if (errorCode === "bad_gateway") return "Внешний сервис авторизации временно недоступен.";
  return "Вход через VK отменен или завершился ошибкой.";
}

function decodeHashPayload(payload: string): VkAuthPayload | null {
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const decoded = JSON.parse(new TextDecoder().decode(bytes)) as Partial<VkAuthPayload>;

    if (typeof decoded.access_token !== "string" || !decoded.user) return null;
    return { access_token: decoded.access_token, user: decoded.user };
  } catch {
    return null;
  }
}

function VkCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const consumeNextPath = () => {
      const nextPath = getSafeRedirectPath(sessionStorage.getItem(OAUTH_NEXT_PATH_KEY));
      sessionStorage.removeItem(OAUTH_NEXT_PATH_KEY);
      return nextPath;
    };

    const completeVkAuth = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const payload = hashParams.get("payload");
      const hashError = hashParams.get("error");

      if (payload) {
        const authPayload = decodeHashPayload(payload);
        if (!authPayload) {
          setError("VK вернул некорректные данные входа.");
          return;
        }

        tokenStore.setLogoutIntent(false);
        tokenStore.set(authPayload.access_token);
        setUser(authPayload.user);
        router.replace(consumeNextPath());
        return;
      }

      if (hashError) {
        setError(getVkCallbackErrorMessage(hashError));
        return;
      }

      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const deviceId = searchParams.get("device_id") ?? undefined;
      const vkError = searchParams.get("error");

      if (vkError) {
        setError(getVkCallbackErrorMessage(vkError));
        return;
      }

      if (!code || !state) {
        setError("VK не вернул необходимые параметры для входа.");
        return;
      }

      try {
        const res = await authApi.vkCallback({
          code,
          state,
          ...(deviceId ? { device_id: deviceId } : {}),
        });
        if (!isMounted) return;

        tokenStore.setLogoutIntent(false);
        tokenStore.set(res.data.access_token);
        setUser(res.data.user);
        router.replace(consumeNextPath());
      } catch (authError) {
        if (!isMounted) return;
        setError(getErrorMessage(authError, "Не удалось завершить вход через VK."));
      }
    };

    completeVkAuth();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams, setUser]);

  return (
    <Container>
      <div className="mx-auto mt-10 w-full max-w-md rounded-[var(--radius-lg)] border p-6 shadow-[var(--shadow-card)]">
        <h1 className="text-xl font-bold">Вход через VK</h1>
        {error ? (
          <>
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
            <Button href="/auth/login" variant="secondary" className="mt-5 w-full">
              Вернуться ко входу
            </Button>
          </>
        ) : (
          <p role="status" className="mt-3 text-sm text-neutral-600">
            Завершаем вход и готовим ваш аккаунт.
          </p>
        )}
        <p className="mt-4 text-center text-sm text-neutral-600">
          <Link className="font-medium text-neutral-900 underline-offset-4 hover:underline" href="/events">
            Перейти к мероприятиям
          </Link>
        </p>
      </div>
    </Container>
  );
}

export default function VkCallbackClient() {
  return (
    <Suspense
      fallback={
        <Container>
          <div className="mx-auto mt-10 w-full max-w-md rounded-[var(--radius-lg)] border p-6 shadow-[var(--shadow-card)]">
            <h1 className="text-xl font-bold">Вход через VK</h1>
            <p role="status" className="mt-3 text-sm text-neutral-600">
              Загружаем параметры входа.
            </p>
          </div>
        </Container>
      }
    >
      <VkCallbackContent />
    </Suspense>
  );
}
