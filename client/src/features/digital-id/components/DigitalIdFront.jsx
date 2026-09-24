import { QRCodeSVG } from 'qrcode.react';
import backgroundImage from '../../../assets/id-card/background.png';
import overlayImage from '../../../assets/id-card/overlay.png';
import defaultLogo from '../../../assets/id-card/logo-mark.png';
import { buildVerifyUrl, toHref } from '../utils/digitalIdUtils';
import { nameFontSize, splitCompanyName, splitFullName } from '../utils/cardText';

/**
 * Front face, built from the design layout (638 x 1013). Layers, bottom
 * to top:
 *
 *   1. background.png   full-bleed artwork
 *   2. profile photo    transparent PNG, anchored bottom-right
 *   3. overlay.png      maroon wave; it sits ABOVE the photo so the
 *                       photo's lower edge disappears behind the curve
 *   4. text, logo, QR
 *
 * Everything is sized in `cqw` (1% of the card width, via the container
 * query on the root), so the card scales as one piece at any width.
 */
export default function DigitalIdFront({ digitalId, interactive = true }) {
  const { id, idNumber, name, position, organization, photo, logo, qrData, contact } = digitalId;
  const company = splitCompanyName(organization);
  const nameLines = splitFullName(name);
  const link = contact?.website?.trim();
  const qrValue = qrData || buildVerifyUrl(id);

  return (
    <div className="id-surface relative h-full w-full overflow-hidden bg-[#220210] font-card text-white [container-type:inline-size]">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />

      <div className="absolute bottom-[24%] left-[18%] right-0 top-[5%]">
        {photo ? (
          <img
            src={photo}
            alt={name ? `Photo of ${name}` : ''}
            className="h-full w-full object-contain object-[right_bottom]"
          />
        ) : (
          <svg
            viewBox="0 0 100 120"
            className="h-full w-full text-white/25"
            preserveAspectRatio="xMaxYMax meet"
            aria-hidden="true"
          >
            <circle cx="50" cy="34" r="20" fill="currentColor" />
            <path d="M8 120c0-30 18-46 42-46s42 16 42 46z" fill="currentColor" />
          </svg>
        )}
      </div>

      <img src={overlayImage} alt="" className="absolute inset-0 h-full w-full object-cover" />

      <header className="absolute left-[5.9%] top-[4.4%] w-[60%]">
        <img
          src={logo || defaultLogo}
          alt="Company logo"
          className="h-[7cqw] max-w-[20cqw] object-contain object-left"
        />
        <p className="mt-[3.2cqw] text-[3.5cqw] font-semibold uppercase leading-[1.1]">
          {company.primary}
        </p>
        {company.secondary && (
          <p className="text-[2.7cqw] font-medium uppercase leading-[1.2]">{company.secondary}</p>
        )}
        {idNumber && (
          <p className="mt-[2.4cqw] text-[3.1cqw] font-light tracking-[0.02em]">
            ID NO: {idNumber}
          </p>
        )}
      </header>

      <div className="absolute inset-x-[8.9%] bottom-[3.4%] flex flex-col">
        <p className="line-clamp-2 text-[4.1cqw] font-light leading-[1.25]">{position}</p>

        <h1
          className="mt-[2.4cqw] max-w-[60%] break-words font-bold uppercase leading-[1.1]"
          style={{ fontSize: `${nameFontSize(nameLines)}cqw` }}
        >
          {nameLines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>

        {link && (
          <a
            href={toHref(link)}
            target="_blank"
            rel="noreferrer noopener"
            tabIndex={interactive ? 0 : -1}
            className="mt-[2cqw] -ml-[1.4cqw] max-w-[52%] truncate text-[3.1cqw] font-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            {link}
          </a>
        )}
      </div>

      <div className="absolute bottom-[3.4%] right-[11.3%] aspect-square w-[21.6cqw]">
        <span className="absolute left-0 top-0 h-[3.8cqw] w-[3.8cqw] border-l-[0.9cqw] border-t-[0.9cqw] border-white" />
        <span className="absolute right-0 top-0 h-[3.8cqw] w-[3.8cqw] border-r-[0.9cqw] border-t-[0.9cqw] border-white" />
        <span className="absolute bottom-0 left-0 h-[3.8cqw] w-[3.8cqw] border-b-[0.9cqw] border-l-[0.9cqw] border-white" />
        <span className="absolute bottom-0 right-0 h-[3.8cqw] w-[3.8cqw] border-b-[0.9cqw] border-r-[0.9cqw] border-white" />
        <div className="absolute inset-[2.2cqw] rounded-[0.8cqw] bg-white p-[1.2cqw]">
          <QRCodeSVG
            value={qrValue}
            size={256}
            level="M"
            marginSize={0}
            fgColor="#220210"
            bgColor="#ffffff"
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
