import TextField from '../../../shared/components/TextField';
import { PlusIcon, TrashIcon } from '../../../shared/components/icons';
import { detectSocialPlatform } from '../utils/digitalIdUtils';
import { SOCIAL_ICONS } from '../utils/socialIcons';

/**
 * Editable form for the Digital ID. Every field here maps 1:1 to a
 * key on the digitalId object (see digitalIdService), so this
 * component never needs to know how the card itself is laid out —
 * it only edits data.
 */
export default function DigitalIdForm({
  digitalId,
  onUpdateField,
  onUpdateContactField,
  onAddSocialLink,
  onUpdateSocialLink,
  onRemoveSocialLink,
}) {
  return (
    <form
      className="flex w-full flex-col gap-6 rounded-2xl border border-line bg-paper p-5 text-left shadow-sm"
      onSubmit={(event) => event.preventDefault()}
    >
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-semibold text-ink">Identity</legend>
        <TextField
          id="field-name"
          label="Full name"
          value={digitalId.name}
          onChange={(value) => onUpdateField('name', value)}
        />
        <TextField
          id="field-position"
          label="Position"
          value={digitalId.position}
          onChange={(value) => onUpdateField('position', value)}
        />
        <TextField
          id="field-secondary-role"
          label="Secondary role"
          value={digitalId.secondaryRole}
          onChange={(value) => onUpdateField('secondaryRole', value)}
        />
        <TextField
          id="field-department"
          label="Department"
          value={digitalId.department}
          onChange={(value) => onUpdateField('department', value)}
        />
        <TextField
          id="field-organization"
          label="Organization"
          value={digitalId.organization}
          onChange={(value) => onUpdateField('organization', value)}
        />
        <TextField
          id="field-id"
          label="ID number"
          value={digitalId.id}
          onChange={(value) => onUpdateField('id', value)}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-semibold text-ink">Contact</legend>
        <TextField
          id="field-phone"
          label="Phone"
          value={digitalId.contact.phone}
          onChange={(value) => onUpdateContactField('phone', value)}
        />
        <TextField
          id="field-website"
          label="Website"
          value={digitalId.contact.website}
          onChange={(value) => onUpdateContactField('website', value)}
        />
        <TextField
          id="field-email"
          label="Email"
          type="email"
          value={digitalId.contact.email}
          onChange={(value) => onUpdateContactField('email', value)}
        />
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 text-sm font-semibold text-ink">Social links (on the back)</legend>
        <p className="text-xs text-ink-soft">
          Paste a profile URL — the icon is detected automatically from the link.
        </p>

        <ul className="flex flex-col gap-2">
          {digitalId.socialLinks.map((link) => {
            const { label, icon } = detectSocialPlatform(link.url);
            const Icon = SOCIAL_ICONS[icon];
            return (
              <li key={link.id} className="flex items-center gap-2">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-paper"
                  aria-hidden="true"
                  title={link.url ? label : 'Paste a link to detect the platform'}
                >
                  <Icon />
                </span>
                <input
                  type="url"
                  value={link.url}
                  onChange={(event) => onUpdateSocialLink(link.id, event.target.value)}
                  placeholder="https://..."
                  aria-label={`Social link: ${label}`}
                  className="min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold"
                />
                <button
                  type="button"
                  onClick={() => onRemoveSocialLink(link.id)}
                  aria-label={`Remove ${label} link`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition hover:bg-line hover:text-maroon-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <TrashIcon />
                </button>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={onAddSocialLink}
          className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-line px-3 py-2 text-sm font-medium text-ink-soft transition hover:border-gold/60 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <PlusIcon />
          Add social link
        </button>
      </fieldset>
    </form>
  );
}
