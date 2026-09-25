// Minimal hand-drawn icon set. Keeping these as plain SVG avoids
// pulling in an icon library for three glyphs.

export function PhoneIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="12" height="12" {...props}>
      <path
        d="M7.5 4.5c.4 1.2.9 2.3 1.6 3.4a1 1 0 0 1-.2 1.3l-1.4 1.1a10.7 10.7 0 0 0 4.8 4.8l1.1-1.4a1 1 0 0 1 1.3-.2c1.1.7 2.2 1.2 3.4 1.6a1 1 0 0 1 .7 1v2.4a1 1 0 0 1-1.1 1C9.9 18.6 5.4 14.1 4.5 5.6a1 1 0 0 1 1-1.1H6.5a1 1 0 0 1 1 .8Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MapPinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="12" height="12" {...props}>
      <path
        d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function GlobeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="12" height="12" {...props}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M4 12h16M12 4c2.2 2.2 3.4 5 3.4 8s-1.2 5.8-3.4 8c-2.2-2.2-3.4-5-3.4-8S9.8 6.2 12 4Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function MailIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="12" height="12" {...props}>
      <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="m5 7.5 7 5.2 7-5.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldCheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16" {...props}>
      <path
        d="M12 3.5 5 6v5.4c0 4.6 3 7.9 7 9.1 4-1.2 7-4.5 7-9.1V6l-7-2.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="m9 12 2.2 2.2L15.5 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FlipIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16" {...props}>
      <path
        d="M4 9a8 8 0 0 1 13.9-5.4M20 15a8 8 0 0 1-13.9 5.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M18 2.5V6h-3.5M6 21.5V18h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ResetIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="16" height="16" {...props}>
      <path
        d="M12 5a7 7 0 1 1-6.3 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path d="M4.5 4.5V9H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlusIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14" {...props}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function TrashIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14" {...props}>
      <path
        d="M5 7h14M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2M7 7l.7 12a1.5 1.5 0 0 0 1.5 1.4h5.6a1.5 1.5 0 0 0 1.5-1.4L17 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14" {...props}>
      <path
        d="M6.5 6.5l11 11m0-11l-11 11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PencilIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14" {...props}>
      <path
        d="M15.2 4.8a1.7 1.7 0 0 1 2.4 0l1.6 1.6a1.7 1.7 0 0 1 0 2.4L9 19H5v-4L15.2 4.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function DownloadIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14" {...props}>
      <path
        d="M12 4.5v11m0 0l-3.8-3.8M12 15.5l3.8-3.8M4.5 16v3a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UploadIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14" {...props}>
      <path
        d="M12 15.5V4.5m0 0L8.2 8.3M12 4.5l3.8 3.8M4.5 15v3a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5v-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Social-platform glyphs, drawn as simple monoline marks so they sit
// comfortably next to the phone/globe/mail icons above rather than
// looking like pasted-in brand logos.

export function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="12" height="12" {...props}>
      <path
        d="M14.5 21v-7h2.3l.4-3h-2.7V9c0-.9.2-1.5 1.5-1.5H17V4.8c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8V11H8.8v3H11v7h3.5Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="12" height="12" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="4.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="16.3" cy="7.7" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function XIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="12" height="12" {...props}>
      <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="12" height="12" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 10.5v6M8 8v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M11.3 16.5v-3.4c0-1.2.8-2 1.9-2s1.8.8 1.8 2v3.4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function YoutubeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="12" height="12" {...props}>
      <rect x="3.5" y="6.5" width="17" height="11" rx="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.5 9.7v4.6l4-2.3-4-2.3Z" fill="currentColor" />
    </svg>
  );
}

export function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="12" height="12" {...props}>
      <path
        d="M12 3.5a8.5 8.5 0 0 0-2.7 16.6c.4.1.6-.2.6-.4v-1.6c-2.4.5-2.9-1.1-2.9-1.1-.4-1-1-1.2-1-1.2-.8-.6.1-.6.1-.6.9.1 1.4.9 1.4.9.8 1.4 2.1 1 2.6.8.1-.6.3-1 .6-1.3-1.9-.2-4-1-4-4.2 0-.9.3-1.7.9-2.3-.1-.2-.4-1.1.1-2.3 0 0 .7-.2 2.3.9a7.9 7.9 0 0 1 4.2 0c1.6-1.1 2.3-.9 2.3-.9.5 1.2.2 2.1.1 2.3.6.6.9 1.4.9 2.3 0 3.2-2.1 4-4 4.2.3.3.6.8.6 1.6v2.4c0 .2.2.5.6.4A8.5 8.5 0 0 0 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TiktokIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="12" height="12" {...props}>
      <path
        d="M14 4v10.2a2.6 2.6 0 1 1-2.2-2.6M14 4c.3 1.8 1.6 3.1 3.4 3.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WhatsappIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="12" height="12" {...props}>
      <path
        d="M6.5 17.5 5 20l2.6-1.5A7.5 7.5 0 1 0 5 12c0 1.4.4 2.6 1 3.7l.5 1.8Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M9.3 10.2c.2.9 1.6 2.7 2.6 3s1.4-.4 1.7-.2c.4.2 1.3.9 1.3 1.2s-.2.9-.6 1c-.7.3-1.6.3-2.9-.4-1.6-.8-2.7-2.4-2.9-2.7-.2-.3-.7-1.1-.6-1.7 0-.5.5-.9.7-1s.5-.1.6.1l.1.7Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function TelegramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="12" height="12" {...props}>
      <path
        d="m4.5 12.3 14.3-6.6c.6-.3 1.2.2 1 .8l-2.5 12c-.1.6-.8.9-1.3.5l-3.6-2.8-1.9 1.9c-.3.3-.8.1-.8-.3l.1-3.3 6.6-6.4c.2-.2 0-.5-.3-.4l-8.2 5.2-3.3-1.1c-.6-.2-.6-1 .1-1.3Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LinkIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="12" height="12" {...props}>
      <path
        d="M9.5 14.5 14.5 9.5M8 15.8l-1.4 1.4a3 3 0 0 1-4.2-4.2l2.8-2.8a3 3 0 0 1 4.2 0M16 8.2l1.4-1.4a3 3 0 1 1 4.2 4.2l-2.8 2.8a3 3 0 0 1-4.2 0"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IdCardIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="2.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8.6" cy="11" r="1.9" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.8 15.3c.4-1.3 1.5-2 2.8-2s2.4.7 2.8 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M14.5 10h4M14.5 13.2h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function UsersIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
      <circle cx="9.3" cy="8.5" r="2.8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.8 18c.6-2.8 2.8-4.4 5.5-4.4s4.9 1.6 5.5 4.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15.3 6.3a2.8 2.8 0 0 1 0 5.4M17.8 18c-.3-1.9-1.2-3.3-2.6-4.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LogoutIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
      <path d="M13.5 4.5H7a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 7 19.5h6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.5 12H20M20 12l-3-3M20 12l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronLeftIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14" {...props}>
      <path d="M14.5 5.5 8 12l6.5 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="14" height="14" {...props}>
      <path d="M9.5 5.5 16 12l-6.5 6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}