import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * Renders the verification QR code for a Digital ID. Data comes in as
 * a plain string so the card back never needs to know how the QR
 * value is produced.
 *
 * Forwards its ref to the underlying <svg> — QRCodeSVG already does
 * this itself, so this just passes it through — so a "Download QR"
 * action elsewhere can read the live node without this component
 * needing to know anything about downloading.
 */
const DigitalIdQrCode = forwardRef(function DigitalIdQrCode({ data, size = 128 }, ref) {
  return (
    <div className="rounded-lg bg-paper p-3 shadow-inner">
      <QRCodeSVG
        ref={ref}
        value={data}
        size={size}
        level="M"
        marginSize={0}
        fgColor="#2a0a12"
        bgColor="transparent"
      />
    </div>
  );
});

export default DigitalIdQrCode;
