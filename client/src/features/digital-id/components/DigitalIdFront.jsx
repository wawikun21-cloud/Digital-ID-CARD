import { getInitials } from '../utils/digitalIdUtils';
import IconBadge from '../../../shared/components/IconBadge';
import { PhoneIcon, GlobeIcon, MailIcon } from '../../../shared/components/icons';

/**
 * Front face: identity at a glance — who this is, their role, and
 * how to reach them. Laid out as a centered vertical stack to suit
 * the card's portrait proportions. Kept free of QR/flip logic.
 */
export default function DigitalIdFront({ digitalId }) {
  const { name, position, secondaryRole, department, organization, id, bio, photo, contact } =
    digitalId;

  return (
    <div className="id-surface flex h-full w-full flex-col bg-paper px-[9%] py-[6%] text-ink">
      <header className="flex items-center justify-between gap-2">
        <span className="truncate font-mono text-[0.6em] font-semibold uppercase tracking-[0.16em] text-gold">
          {organization}
        </span>
        <span className="shrink-0 font-mono text-[0.56em] tracking-[0.06em] text-ink-soft">{id}</span>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {photo ? (
          <img
            src={photo}
            alt=""
            className="h-[4.6em] w-[4.6em] rounded-full object-cover ring-2 ring-gold/60"
          />
        ) : (
          <div className="flex h-[4.6em] w-[4.6em] items-center justify-center rounded-full bg-gradient-to-br from-ink to-maroon-light text-[1.35em] font-serif font-semibold text-paper ring-2 ring-gold/60">
            {getInitials(name)}
          </div>
        )}

        <h1 className="mt-[0.7em] font-serif text-[1.18em] font-semibold leading-tight text-ink">
          {name}
        </h1>
        <p className="mt-[0.3em] text-[0.72em] font-medium text-ink-soft">{position}</p>
        {secondaryRole && (
          <p className="mt-[0.1em] text-[0.64em] text-ink-soft/80">{secondaryRole}</p>
        )}

        <span className="mt-[0.8em] rounded-full border border-gold/50 px-[0.7em] py-[0.22em] text-[0.56em] font-medium uppercase tracking-[0.09em] text-gold">
          {department}
        </span>

        {bio && (
          <p className="mt-[0.9em] line-clamp-2 max-w-[92%] text-[0.62em] italic leading-snug text-ink-soft/90">
            “{bio}”
          </p>
        )}
      </div>

      <div className="h-px w-full bg-line" />

      <ul className="mt-[6%] flex flex-col gap-[0.4em]">
        <li className="flex min-w-0 items-center gap-[0.5em] text-[0.6em] text-ink-soft">
          <IconBadge icon={<PhoneIcon />} />
          <span className="truncate">{contact.phone}</span>
        </li>
        <li className="flex min-w-0 items-center gap-[0.5em] text-[0.6em] text-ink-soft">
          <IconBadge icon={<GlobeIcon />} />
          <span className="truncate">{contact.website}</span>
        </li>
        <li className="flex min-w-0 items-center gap-[0.5em] text-[0.6em] text-ink-soft">
          <IconBadge icon={<MailIcon />} />
          <span className="truncate">{contact.email}</span>
        </li>
      </ul>
    </div>
  );
}
