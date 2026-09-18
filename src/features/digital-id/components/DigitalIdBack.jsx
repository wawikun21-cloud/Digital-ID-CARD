import DigitalIdQrCode from './DigitalIdQrCode';
import { ShieldCheckIcon } from '../../../shared/components/icons';
import {
  formatIssueDate,
  detectSocialPlatform,
  toHref,
  buildVerifyUrl,
} from '../utils/digitalIdUtils';
import { SOCIAL_ICONS } from '../utils/socialIcons';

/**
 * Back face: verification plus, optionally, a row of social links.
 * The QR stays the primary job; social icons are a secondary strip
 * beneath it, each one a real link so it can be tapped/scanned.
 *
 * `qrRef` is threaded through from DigitalIdCard rather than owned
 * here: the "Download QR" action now lives outside the card (see
 * DigitalIdCard), and both faces are always mounted in the DOM — just
 * rotated out of view via CSS — so that action can read the live
 * <svg> node without needing the card flipped to the back first.
 */
export default function DigitalIdBack({ digitalId, interactive = true, qrRef }) {
  const { id, organization, qrData, issued, expires, socialLinks = [] } = digitalId;
  const validLinks = socialLinks.filter((link) => link.url.trim() !== '');

  // Derived from the ID number unless the record pins its own value,
  // so editing the ID number re-points the QR code straight away.
  const verifyUrl = qrData || buildVerifyUrl(id);

  return (
    <div className="id-surface id-surface--dark id-guilloche flex h-full w-full flex-col items-center justify-between bg-ink px-[6%] py-[6%] text-paper">
      <header className="flex w-full items-center justify-between">
        <span className="font-mono text-[0.6em] font-semibold uppercase tracking-[0.18em] text-gold">
          {organization}
        </span>
        <span className="flex items-center gap-[0.4em] text-[0.58em] text-paper/70">
          <ShieldCheckIcon className="text-gold" />
          Verified ID
        </span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-[0.6em]">
        <DigitalIdQrCode ref={qrRef} data={verifyUrl} size={100} />
        <p className="text-[0.6em] tracking-[0.02em] text-paper/70">Scan to verify identity</p>

        {validLinks.length > 0 && (
          <ul className="mt-[0.3em] flex flex-wrap items-center justify-center gap-[0.5em]">
            {validLinks.map((link) => {
              const { label, icon } = detectSocialPlatform(link.url);
              const Icon = SOCIAL_ICONS[icon];
              return (
                <li key={link.id}>
                  <a
                    href={toHref(link.url)}
                    target="_blank"
                    rel="noreferrer noopener"
                    title={label}
                    aria-label={label}
                    tabIndex={interactive ? 0 : -1}
                    className="flex h-[1.9em] w-[1.9em] items-center justify-center rounded-full border border-gold/40 bg-paper/10 text-paper transition hover:border-gold hover:bg-paper/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                  >
                    <Icon />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <footer className="w-full">
        <div className="h-px w-full bg-paper/15" />
        <div className="mt-[0.6em] flex flex-col items-center gap-[0.15em] text-center text-[0.58em] text-paper/60">
          <span className="font-mono tracking-[0.05em]">{id}</span>
          <span>
            Issued {formatIssueDate(issued)} · Valid to {formatIssueDate(expires)}
          </span>
        </div>
      </footer>
    </div>
  );
}
