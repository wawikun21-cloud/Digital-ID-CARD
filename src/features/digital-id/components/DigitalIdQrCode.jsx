import { QRCodeSVG } from 'qrcode.react';

/**
 * Renders the verification QR code for a Digital ID. Data comes in as
 * a plain string so the card back never needs to know how the QR
 * value is produced (mock today, an API-issued token later).
 */
export default function DigitalIdQrCode({ data, size = 128 }) {
  return (
    <div className="rounded-lg bg-paper p-3 shadow-inner">
      <QRCodeSVG
        value={data}
        size={size}
        level="M"
        marginSize={0}
        fgColor="#2a0a12"
        bgColor="transparent"
      />
    </div>
  );
}
