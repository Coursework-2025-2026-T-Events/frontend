"use client";

import { QRCodeSVG } from "qrcode.react";

type Props = {
  value: string;
  token?: string;
  size?: number;
  expiresAt?: string;
};

export default function QrCodeDisplay({ value, size = 216, expiresAt }: Props) {
  return (
    <div
      className="inline-flex max-w-full flex-col items-center rounded-[var(--radius-md)] bg-white p-3 shadow-[inset_0_0_0_1px_var(--color-brand-line)]"
      role="img"
      aria-label="QR-код для получения приза"
    >
      <QRCodeSVG
        value={value}
        size={size}
        level="M"
        marginSize={4}
        title="QR-код для получения приза"
        className="h-auto max-w-full"
      />
      {expiresAt && (
        <p className="mt-2 text-center text-[13px] leading-5 text-[var(--color-brand-muted)]">
          Действует до{" "}
          {new Date(expiresAt).toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
    </div>
  );
}
