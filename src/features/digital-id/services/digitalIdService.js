/**
 * Digital ID data source.
 *
 * `fetchDigitalId` is async on purpose: today it resolves a local mock
 * object, but the call site never needs to change when this is wired up
 * to a real endpoint. Swap the body of this function for a `fetch(...)`
 * call and nothing in the components has to know the difference.
 */

const MOCK_DIGITAL_ID = {
  id: 'CIT-2026-0001',
  name: 'Benneth A. Aloyon, MIT',
  position: 'Dean, College of Information Technology',
  secondaryRole: 'Founder, BAA Digital Marketing Services',
  department: 'College of Information Technology',
  organization: 'BAA Digital',
  photo: null,
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
  qrData: 'https://example.com/verify/CIT-2026-0001',
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
