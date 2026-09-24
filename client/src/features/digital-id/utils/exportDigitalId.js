/**
 * Client-side export of the whole Digital ID (front + back) as a PNG or
 * PDF. Everything runs in the browser, so it needs no server, headless
 * browser or extra hosting features: it works on static / shared hosting.
 *
 * The caller mounts the two faces at their native size (FACE_WIDTH x
 * FACE_HEIGHT, the design's pixel size) and hands the DOM nodes in.
 * Each face is rasterised at PIXEL_RATIO x, then packed into the file.
 */
import { getFontEmbedCSS, toCanvas } from 'html-to-image';

/** Native size of one card face, in CSS pixels (matches the design). */
export const FACE_WIDTH = 638;
export const FACE_HEIGHT = 1013;

const PIXEL_RATIO = 2;
/** CR80 card (ID-1) size in millimetres: the standard plastic ID card. */
const CARD_MM = { width: 53.98, height: 85.6 };
/** CR80 corner radius as a fraction of card width (3.18 mm / 53.98 mm). */
const CORNER_RATIO = 0.059;
/** Transparent space between the two faces in the PNG, in CSS pixels. */
const PNG_GAP = 48;
const FONT_WEIGHTS = ['300', 'italic 300', '500', '600', '700'];

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

/** Wait until every image has decoded and the card font is ready. */
async function waitForAssets(nodes) {
  await nextFrame();
  await Promise.all(FONT_WEIGHTS.map((weight) => document.fonts.load(`${weight} 16px Poppins`)));
  await document.fonts.ready;
  const images = nodes.flatMap((node) => [...node.querySelectorAll('img')]);
  await Promise.all(images.map((image) => image.decode?.().catch(() => {})));
}

async function renderFaces(nodes) {
  await waitForAssets(nodes);
  const options = {
    width: FACE_WIDTH,
    height: FACE_HEIGHT,
    pixelRatio: PIXEL_RATIO,
    fontEmbedCSS: await getFontEmbedCSS(nodes[0]),
  };
  // Safari draws images blank on the first pass; a throwaway render primes them.
  if (isSafari()) await toCanvas(nodes[0], options);

  const canvases = [];
  for (const node of nodes) canvases.push(await toCanvas(node, options)); // one at a time: keeps memory low
  return canvases;
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not encode the image.'))), type, quality);
  });
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

/** Front and back side by side on a transparent background, with rounded card corners. */
function composeSideBySide(faces) {
  const [front] = faces;
  const gap = PNG_GAP * PIXEL_RATIO;
  const sheet = document.createElement('canvas');
  sheet.width = front.width * faces.length + gap * (faces.length - 1);
  sheet.height = front.height;
  const ctx = sheet.getContext('2d');

  faces.forEach((face, index) => {
    const x = index * (face.width + gap);
    ctx.save();
    roundedRectPath(ctx, x, 0, face.width, face.height, face.width * CORNER_RATIO);
    ctx.clip();
    ctx.drawImage(face, x, 0);
    ctx.restore();
  });
  return sheet;
}

function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** "Nalche Congayo, MIT" -> "nalche-congayo-mit-digital-id" */
export function exportFileBase(name) {
  const slug = (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'my'}-digital-id`;
}

/** @param {HTMLElement[]} nodes [front, back] mounted at FACE_WIDTH x FACE_HEIGHT */
export async function downloadDigitalIdPng(nodes, fileBase) {
  const sheet = composeSideBySide(await renderFaces(nodes));
  saveBlob(await canvasToBlob(sheet, 'image/png'), `${fileBase}.png`);
}

const encoder = new TextEncoder();

/**
 * Minimal PDF writer: one JPEG per page, page size = card size. It is all
 * a card export needs, and it avoids a PDF library (jsPDF drags in several
 * optional packages that can fail to install and add ~600 KB to the app).
 *
 * @param {{ jpeg: Uint8Array, width: number, height: number }[]} pages
 * @returns {Blob}
 */
function buildPdf(pages, pageWidthMm, pageHeightMm) {
  const pt = (mm) => ((mm * 72) / 25.4).toFixed(2);
  const pageWidth = pt(pageWidthMm);
  const pageHeight = pt(pageHeightMm);

  const chunks = [];
  const offsets = [];
  let length = 0;
  const write = (data) => {
    const bytes = typeof data === 'string' ? encoder.encode(data) : data;
    chunks.push(bytes);
    length += bytes.length;
  };
  const beginObject = (id) => {
    offsets[id] = length;
    write(`${id} 0 obj\n`);
  };

  // Objects: 1 catalog, 2 page tree, 3 info, then per page: page, content, image.
  const pageId = (index) => 4 + index * 3;
  write('%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n');

  beginObject(1);
  write('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  beginObject(2);
  const kids = pages.map((_, index) => `${pageId(index)} 0 R`).join(' ');
  write(`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>\nendobj\n`);
  beginObject(3);
  write('<< /Title (Digital ID) /Producer (Digital ID Card) >>\nendobj\n');

  pages.forEach((page, index) => {
    const id = pageId(index);
    const content = `q ${pageWidth} 0 0 ${pageHeight} 0 0 cm /Im0 Do Q`;

    beginObject(id);
    write(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
        `/Resources << /XObject << /Im0 ${id + 2} 0 R >> >> /Contents ${id + 1} 0 R >>\nendobj\n`,
    );
    beginObject(id + 1);
    write(`<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`);
    beginObject(id + 2);
    write(
      `<< /Type /XObject /Subtype /Image /Width ${page.width} /Height ${page.height} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.jpeg.length} >>\nstream\n`,
    );
    write(page.jpeg);
    write('\nendstream\nendobj\n');
  });

  const objectCount = pageId(pages.length - 1) + 3; // ids 1..objectCount-1 are used
  const xrefOffset = length;
  let xref = `xref\n0 ${objectCount}\n0000000000 65535 f \n`;
  for (let id = 1; id < objectCount; id += 1) {
    xref += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  }
  write(xref);
  write(`trailer\n<< /Size ${objectCount} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  return new Blob(chunks, { type: 'application/pdf' });
}

/** Two-page PDF at real CR80 card size (front, then back), ready to print. */
export async function downloadDigitalIdPdf(nodes, fileBase) {
  const faces = await renderFaces(nodes);
  const pages = [];
  for (const face of faces) {
    const blob = await canvasToBlob(face, 'image/jpeg', 0.95);
    pages.push({
      jpeg: new Uint8Array(await blob.arrayBuffer()),
      width: face.width,
      height: face.height,
    });
  }
  saveBlob(buildPdf(pages, CARD_MM.width, CARD_MM.height), `${fileBase}.pdf`);
}