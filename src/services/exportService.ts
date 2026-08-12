/**
 * Lana Export Engine Service
 * Renders high-resolution (1080x1350 4:5 vertical feed) slide PNGs,
 * packages full carousels into ZIP archives, and exports PDFs.
 */

import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Carousel } from '../types/lana';

// ─── Export Single Slide PNG ──────────────────────────────────────────────────

export async function exportSlidePng(
  element: HTMLElement,
  filename: string = 'slide-1.png'
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 3, // 3x resolution for ultra crisp 1080x1350 PNG export
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    logging: false,
  });

  canvas.toBlob((blob) => {
    if (blob) {
      saveAs(blob, filename);
    }
  }, 'image/png');
}

// ─── Export Full Carousel ZIP Archive ─────────────────────────────────────────

export async function exportCarouselZip(
  slideElements: HTMLElement[],
  carousel: Carousel,
  brandName: string = 'Lana',
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const zip = new JSZip();
  const folderName = `${brandName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${carousel.title.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const folder = zip.folder(folderName) || zip;

  const total = slideElements.length;

  for (let i = 0; i < total; i++) {
    if (onProgress) onProgress(i + 1, total);

    const elem = slideElements[i];
    const canvas = await html2canvas(elem, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    });

    const dataUrl = canvas.toDataURL('image/png');
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');

    const slideNum = String(i + 1).padStart(2, '0');
    folder.file(`Slide_${slideNum}.png`, base64Data, { base64: true });
  }

  // Also include caption & hashtags text file inside the zip
  const captionContent = `CAROUSEL CAPTION & HASHTAGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Brand: ${brandName}
Title: ${carousel.title}
Status: ${carousel.status}

CAPTION:
${carousel.caption.text}

CALL TO ACTION:
${carousel.caption.cta}

HASHTAGS:
${carousel.caption.hashtags.join(' ')}
`;
  folder.file('Caption_and_Hashtags.txt', captionContent);

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `${folderName}_Carousel_Pack.zip`);
}
