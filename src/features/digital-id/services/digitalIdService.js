/**
 * Digital ID data source.
 *
 * `fetchDigitalId` is async on purpose: today it resolves a local mock
 * object, but the call site never needs to change when this is wired up
 * to a real endpoint. Swap the body of this function for a `fetch(...)`
 * call and nothing in the components has to know the difference.
 */

import defaultProfilePhoto from '../../../assets/default-profile.jpg';

/**
 * Photo used when a Digital ID has no uploaded picture of its own.
 * Exported so the form can offer "restore default" after an upload.
 */
export const DEFAULT_PROFILE_PHOTO = defaultProfilePhoto;

const MOCK_DIGITAL_ID = {
  id: 'CIT-2026-0001',
  name: 'Benneth A. Aloyon, MIT',
  position: 'Dean, College of Information Technology',
  secondaryRole: 'Founder, BAA Digital Marketing Services',
  department: 'College of Information Technology',
  organization: 'BAA Digital',
  photo: DEFAULT_PROFILE_PHOTO,
  contact: {
    phone: '+63 931 984 9574',
    website: 'www.baadigital.com',
    email: 'bennethaloyon@gmail.com',
  },
  socialLinks: [
    { id: 'social-seed-1', url: 'https://www.facebook.com/iamdeanbaa' },
  ],
  issued: '2026-01-15',
  expires: '2028-01-15',
  // No `qrData` on purpose: the card derives the verification URL from
  // the ID number via buildVerifyUrl(), so an edited ID number and its
  // QR code can never drift apart. Set `qrData` here only to pin a
  // one-off value that shouldn't follow the ID.
};

/**
 * @returns {Promise<typeof MOCK_DIGITAL_ID>}
 */
export async function fetchDigitalId() {
  // TODO: replace with a real request, e.g.
  // const res = await fetch(`/api/digital-id/${employeeId}`);
  // if (!res.ok) throw new Error('Failed to load digital ID');
  // return res.json();
  return Promise.resolve(MOCK_DIGITAL_ID);
}
