import type { Metadata } from "next";
import AuditLogsClient from "./AuditLogsClient";

export const metadata: Metadata = {
  title: "Журнал аудита - T-Events",
  description: "Экспорт административного журнала аудита T-Events в CSV с фильтрами по событиям и действиям.",
};

export default function AdminAuditLogsPage() {
  return <AuditLogsClient />;
}

