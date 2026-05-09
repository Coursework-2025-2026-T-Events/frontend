import { NextRequest, NextResponse } from "next/server";
import type { LoginResponse } from "@/lib/api/types";

const backendApiOrigin = process.env.BACKEND_API_ORIGIN ?? "http://localhost:8080";
const publicOrigin = process.env.PUBLIC_ORIGIN;

function encodeHashPayload(payload: unknown): string {
  const json = JSON.stringify(payload);
  return Buffer.from(json, "utf8").toString("base64url");
}

function redirectToClient(request: NextRequest, hashParams: Record<string, string>) {
  const origin =
    publicOrigin ??
    `${request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "")}://${
      request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host
    }`;
  const url = new URL("/auth/vk/callback", origin);
  const hash = new URLSearchParams(hashParams);
  url.hash = hash.toString();
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const deviceId = request.nextUrl.searchParams.get("device_id");
  const vkError = request.nextUrl.searchParams.get("error");

  if (vkError) {
    return redirectToClient(request, { error: vkError });
  }

  if (!code || !state) {
    return redirectToClient(request, { error: "missing_vk_callback_params" });
  }

  const callbackUrl = new URL("/api/v1/auth/vk/callback", backendApiOrigin);
  callbackUrl.searchParams.set("code", code);
  callbackUrl.searchParams.set("state", state);
  if (deviceId) callbackUrl.searchParams.set("device_id", deviceId);

  try {
    const backendResponse = await fetch(callbackUrl, {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      redirect: "manual",
    });

    const setCookie = backendResponse.headers.get("set-cookie");
    const responseText = await backendResponse.text();

    if (!backendResponse.ok) {
      const response = redirectToClient(request, { error: "vk_callback_failed" });
      if (setCookie) response.headers.append("set-cookie", setCookie);
      return response;
    }

    const data = JSON.parse(responseText) as LoginResponse;
    const response = redirectToClient(request, { payload: encodeHashPayload(data.data) });
    if (setCookie) response.headers.append("set-cookie", setCookie);
    return response;
  } catch {
    return redirectToClient(request, { error: "vk_callback_failed" });
  }
}
