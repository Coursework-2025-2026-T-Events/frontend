import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Вход - T-Events",
  description: "Вход в аккаунт T-Events для участия в мероприятиях и получения наград.",
};

export default function LoginPage() {
  return <LoginClient />;
}
