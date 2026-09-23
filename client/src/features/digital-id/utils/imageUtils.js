/**
 * Browser-side image helpers for the profile photo upload.
 *
 * The photo lives in React state as a data URL, which means whatever
 * the person picks is carried around in memory (and would be carried
 * over the wire once this is wired to a real API). A 6 MB phone photo
 * would be wasteful for something rendered at ~5em wide, so uploads
 * are center-cropped to a square and downscaled before they're stored.
 */

/** Largest file we'll accept before downscaling, in bytes. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** Edge length of the stored square photo, in pixels. */
const OUTPUT_SIZE = 512;

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Human-readable accept attribute for the file input. */
export const ACCEPTED_IMAGE_TYPES = ACCEPTED_TYPES.join(',');

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('That file could not be read as an image.'));
    image.src = src;
  });
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('That file could not be read.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate, center-crop and downscale a picked file.
 *
 * @param {File} file
 * @returns {Promise<string>} a JPEG data URL, square, OUTPUT_SIZE per side
 * @throws {Error} with a message safe to show the user
 */
export async function processProfilePhoto(file) {
  if (!file) throw new Error('No file selected.');

  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error('Please choose a JPG, PNG or WebP image.');
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('That image is larger than 8 MB. Please choose a smaller one.');
  }

  const dataUrl = await readAsDataUrl(file);
  const image = await loadImage(dataUrl);

  // Center-crop to a square so the round frame on the card never
  // distorts a portrait or landscape original.
  const edge = Math.min(image.naturalWidth, image.naturalHeight);
  const sx = (image.naturalWidth - edge) / 2;
  const sy = (image.naturalHeight - edge) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const context = canvas.getContext('2d');
  if (!context) return dataUrl; // Canvas unavailable — keep the original.

  context.imageSmoothingQuality = 'high';
  context.drawImage(image, sx, sy, edge, edge, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  return canvas.toDataURL('image/jpeg', 0.86);
}
