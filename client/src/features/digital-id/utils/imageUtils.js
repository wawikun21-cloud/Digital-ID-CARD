/**
 * Browser-side image helpers for the profile photo and company logo.
 *
 * The ID card layers the photo UNDER a decorative overlay, so the photo
 * must be a PNG with a transparent background. Nothing here converts
 * to JPEG or flattens the alpha channel. The photo is also trimmed to
 * its visible pixels, so every cut-out lands in the same place on the
 * card no matter how much empty canvas surrounded it.
 */

/** Largest file we'll accept before downscaling, in bytes. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** Longest edge of the stored photo, in pixels. */
const PHOTO_MAX_EDGE = 1400;

/** Longest edge of the stored logo, in pixels. */
const LOGO_MAX_EDGE = 600;

/** Pixels at or below this alpha are treated as empty when trimming. */
const TRIM_ALPHA_THRESHOLD = 16;

/** Human-readable accept attribute for the file input. */
export const ACCEPTED_IMAGE_TYPES = 'image/png';

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

function validatePng(file) {
  if (!file) throw new Error('No file selected.');
  if (file.type !== 'image/png') throw new Error('Please choose a PNG image.');
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('That image is larger than 8 MB. Please choose a smaller one.');
  }
}

function drawScaled(image, maxEdge) {
  const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Image processing is not supported in this browser.');
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return { canvas, context };
}

/** Bounding box of pixels above the alpha threshold, or null if none. */
function findOpaqueBounds({ width, height, data }) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let translucent = false;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha < 250) translucent = true;
      if (alpha > TRIM_ALPHA_THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) return { empty: true, translucent };
  return { empty: false, translucent, minX, minY, maxX, maxY };
}

/**
 * Validate a transparent-background PNG, downscale it and trim the
 * empty margin around the subject.
 *
 * @param {File} file
 * @returns {Promise<string>} a PNG data URL
 * @throws {Error} with a message safe to show the user
 */
export async function processProfilePhoto(file) {
  validatePng(file);
  const image = await loadImage(await readAsDataUrl(file));
  const { canvas, context } = drawScaled(image, PHOTO_MAX_EDGE);

  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  const bounds = findOpaqueBounds(pixels);

  if (bounds.empty) throw new Error('That image looks completely transparent.');
  if (!bounds.translucent) {
    throw new Error(
      'This PNG has no transparent background. Please upload a cut-out with the background removed.',
    );
  }

  const width = bounds.maxX - bounds.minX + 1;
  const height = bounds.maxY - bounds.minY + 1;
  const trimmed = document.createElement('canvas');
  trimmed.width = width;
  trimmed.height = height;
  trimmed
    .getContext('2d')
    .drawImage(canvas, bounds.minX, bounds.minY, width, height, 0, 0, width, height);

  return trimmed.toDataURL('image/png');
}

/**
 * Validate and downscale a company logo PNG. Transparency is kept;
 * the logo is not trimmed or required to be transparent.
 *
 * @param {File} file
 * @returns {Promise<string>} a PNG data URL
 */
export async function processLogo(file) {
  validatePng(file);
  const image = await loadImage(await readAsDataUrl(file));
  return drawScaled(image, LOGO_MAX_EDGE).canvas.toDataURL('image/png');
}
