import {
  FacebookIcon,
  InstagramIcon,
  XIcon,
  LinkedinIcon,
  YoutubeIcon,
  GithubIcon,
  TiktokIcon,
  WhatsappIcon,
  TelegramIcon,
  LinkIcon,
} from '../../../shared/components/icons';

/**
 * Lookup table from the plain string keys `detectSocialPlatform`
 * returns to the actual icon component. Kept as data (not part of
 * digitalIdUtils.js) so utils stays framework-free and components
 * import icons the normal way.
 */
export const SOCIAL_ICONS = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  x: XIcon,
  linkedin: LinkedinIcon,
  youtube: YoutubeIcon,
  github: GithubIcon,
  tiktok: TiktokIcon,
  whatsapp: WhatsappIcon,
  telegram: TelegramIcon,
  link: LinkIcon,
};
