import type { Metadata } from "next";
import VkCallbackClient from "./VkCallbackClient";

export const metadata: Metadata = {
  title: "Вход через VK - T-Events",
  description: "Завершение входа в T-Events через VK ID.",
};

export default function VkCallbackPage() {
  return <VkCallbackClient />;
}
