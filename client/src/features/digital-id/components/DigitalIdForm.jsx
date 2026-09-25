import TextField from '../../../shared/components/TextField';
import TextAreaField from '../../../shared/components/TextAreaField';
import { PlusIcon, TrashIcon, ResetIcon } from '../../../shared/components/icons';
import { detectSocialPlatform } from '../utils/digitalIdUtils';
import ProfilePhotoField from './ProfilePhotoField';
import { processLogo } from '../utils/imageUtils';
import { SOCIAL_ICONS } from '../utils/socialIcons';

export default function DigitalIdForm({
  digitalId,
  onUpdateField,
  onUpdateContactField,
  onAddSocialLink,
  onUpdateSocialLink,
  onRemoveSocialLink,
  onResetToDefault,
  isAdmin = false,
}) {
  function handleResetToDefault() {
    const confirmed = window.confirm(
      'Reset every field back to the default details? This clears whatever is saved here and cannot be undone.',
    );
    if (confirmed) onResetToDefault();
  }

  return (
    <form
      className="flex w-full flex-col gap-6 text-left"
      onSubmit={(event) => event.preventDefault()}
    >
      <ProfilePhotoField
        photo={digitalId.photo}
        onChange={(value) => onUpdateField('photo', value)}
      />

      {isAdmin && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 text-sm font-semibold text-ink">Branding</legend>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-ink">Company logo (PNG)</span>
            <input
              type="file"
              accept="image/png"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                try {
                  onUpdateField('logo', await processLogo(file));
                } catch (err) {
                  window.alert(err.message);
                }
              }}
              className="rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-gold focus:ring-1 focus:ring-gold"
            />
          </label>
        </fieldset>
      )}

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
          label="Company name"
          value={digitalId.organization}
          onChange={(value) => onUpdateField('organization', value)}
        />
        <TextAreaField
          id="field-bio"
          label="Bio / motto"
          placeholder="A short line that says who you are"
          rows={2}
          maxLength={120}
          value={digitalId.bio ?? ''}
          onChange={(value) => onUpdateField('bio', value)}
        />
        <TextField
          id="field-id"
          label="ID number"
          value={digitalId.idNumber ?? ''}
          onChange={(value) => onUpdateField('idNumber', value)}
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
          label="Link (shown on the card)"
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
        <legend className="mb-1 text-sm font-semibold text-ink">QR code</legend>
        <TextField
          id="field-website-link"
          label="Website link (QR code on the front)"
          type="url"
          placeholder="https://www.example.com"
          value={digitalId.websiteLink ?? ''}
          onChange={(value) => onUpdateField('websiteLink', value)}
        />
        <p className="text-xs text-ink-soft">
          The QR code on the front opens this link. Leave it empty to use the verification page.
        </p>
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

      <div className="flex flex-col items-start gap-1 border-t border-line pt-4">
        <button
          type="button"
          onClick={handleResetToDefault}
          className="flex items-center gap-1.5 text-xs font-medium text-ink-soft transition hover:text-maroon-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <ResetIcon />
          Reset to default details
        </button>
        <p className="text-[0.7rem] text-ink-soft/70">
          Deletes your saved details right away and restores the defaults.
        </p>
      </div>
    </form>
  );
}