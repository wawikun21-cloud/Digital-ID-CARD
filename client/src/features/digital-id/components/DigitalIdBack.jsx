import backgroundImage from '../../../assets/id-card/background.png';
import { MailIcon, PhoneIcon, MapPinIcon } from '../../../shared/components/icons';
import { detectSocialPlatform, toHref } from '../utils/digitalIdUtils';
import { SOCIAL_ICONS } from '../utils/socialIcons';

/**
 * Back face: bio / motto, social links, and contact details (email,
 * phone, address), over the same background artwork as the front.
 * Sized in `cqw` like the front, so it scales with the card.
 */
export default function DigitalIdBack({ digitalId, interactive = true }) {
  const { bio, socialLinks = [], contact = {}, address } = digitalId;
  const validLinks = socialLinks.filter((link) => link.url.trim() !== '');
  const rows = [
    { key: 'email', Icon: MailIcon, value: contact.email, href: contact.email && `mailto:${contact.email}` },
    { key: 'phone', Icon: PhoneIcon, value: contact.phone, href: contact.phone && `tel:${contact.phone.replace(/\s+/g, '')}` },
    { key: 'address', Icon: MapPinIcon, value: address },
  ].filter((row) => row.value?.trim());

  return (
    <div className="id-surface relative h-full w-full overflow-hidden bg-[#220210] font-card text-white [container-type:inline-size]">
      <img src={backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#220210]/30 via-[#220210]/55 to-[#220210]/90" />

      <div className="absolute inset-x-[9%] inset-y-[8%] flex flex-col justify-between">
        <div>
          {bio?.trim() && (
            <p className="line-clamp-6 text-[5cqw] font-light italic leading-[1.45]">“{bio}”</p>
          )}
        </div>

        <div className="flex flex-col gap-[6cqw]">
          {validLinks.length > 0 && (
            <ul className="flex flex-wrap items-center gap-[3cqw]">
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
                      className="flex h-[9cqw] w-[9cqw] items-center justify-center rounded-full border border-white/40 bg-white/10 text-white transition hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white [&_svg]:h-[45%] [&_svg]:w-[45%]"
                    >
                      <Icon />
                    </a>
                  </li>
                );
              })}
            </ul>
          )}

          {rows.length > 0 && (
            <ul className="flex flex-col gap-[3.2cqw]">
              {rows.map(({ key, Icon, value, href }) => (
                <li key={key} className="flex items-start gap-[3cqw] text-[3.4cqw] font-light leading-[1.35]">
                  <span className="mt-[0.4cqw] flex h-[6cqw] w-[6cqw] shrink-0 items-center justify-center rounded-full bg-white/15 [&_svg]:h-[55%] [&_svg]:w-[55%]">
                    <Icon />
                  </span>
                  {href ? (
                    <a href={href} tabIndex={interactive ? 0 : -1} className="min-w-0 break-words self-center">
                      {value}
                    </a>
                  ) : (
                    <span className="min-w-0 break-words self-center">{value}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}