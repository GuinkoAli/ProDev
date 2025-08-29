import * as React from "react";

interface QrCodeProps {
  url: string;
  size?: number;
  className?: string;
}

// Placeholder QR component. We can swap to a local generator later.
export function QrCode({ url, size = 160, className }: QrCodeProps) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    url
  )}`;
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt="QR code for sharing"
      className={className}
    />
  );
}


