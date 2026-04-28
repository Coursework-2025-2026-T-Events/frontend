"use client";

import { QRCodeSVG } from "qrcode.react";

type Props = {
  value: string;
  token: string;
  size?: number;
  expiresAt?: string;
};

export default function QrCodeDisplay({ value, token, size = 220, expiresAt }: Props) {
  return (
    <div
      className="inline-flex max-w-full flex-col items-center rounded-lg border border-neutral-200 bg-white p-3 shadow-sm"
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
        <p className="mt-2 text-center text-xs text-neutral-600">
          Действует до{" "}
          {new Date(expiresAt).toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      )}
      <p className="mt-1 max-w-[220px] break-all text-center font-mono text-[10px] text-neutral-400">
        {token.slice(0, 24)}...
      </p>
    </div>
  );
}
