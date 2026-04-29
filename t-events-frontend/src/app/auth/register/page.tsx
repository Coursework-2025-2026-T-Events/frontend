import type { Metadata } from "next";
import RegisterClient from "./RegisterClient";

export const metadata: Metadata = {
  title: "Регистрация - T-Events",
  description: "Создание аккаунта T-Events для прохождения игр, накопления баллов и получения наград.",
};

export default function RegisterPage() {
  return <RegisterClient />;
}
