/**
 * Turns the QR code's live <svg> node into a downloadable PNG.
 *
 * The on-card QR is deliberately rendered with no margin and a
 * transparent background (see DigitalIdQrCode) so it can sit inside
 * its own padded, colored container on the card face. A standalone
 * file needs the opposite: an opaque background and a real quiet
 * zone around the modules, or scanners held up to a phone screen or
 * a print-out may fail to lock onto it. This adds both at export
 * time rather than changing how the QR renders on the card.
 */

/** Output size, in pixels, of the downloaded PNG (square). */
const OUTPUT_SIZE = 640;

/** Quiet zone as a fraction of the output size, each side. */
const QUIET_ZONE_RATIO = 0.12;

function svgNodeToDataUrl(svgElement) {
  const serialized = new XMLSerializer().serializeToString(svgElement);
  const encoded = encodeURIComponent(serialized).replace(/'/g, '%27').replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not render the QR code for download.'));
    image.src = src;
  });
}

/**
 * @param {SVGSVGElement} svgElement the QR code's rendered <svg> node
 * @param {string} fileName file name to save as, including extension
 */
export async function downloadQrCodePng(svgElement, fileName) {
  if (!svgElement) throw new Error('QR code is not ready yet.');

  const image = await loadImage(svgNodeToDataUrl(svgElement));

  const canvas = document.createElement('canvas');
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Downloading is not supported in this browser.');

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  const margin = OUTPUT_SIZE * QUIET_ZONE_RATIO;
  const drawSize = OUTPUT_SIZE - margin * 2;
  context.drawImage(image, margin, margin, drawSize, drawSize);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Could not generate the PNG file.');

  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
