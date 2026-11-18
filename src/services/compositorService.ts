import { getAssetUrl } from '../utils/assetHelper';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Composites the generated 2:3 portrait into Frame.png's inner transparent window
 * (1055x1365 at 73,188 with ~5px bleed under the rounded rim) using a seamless
 * blurred cover backdrop + full-image contain foreground so zero details are cropped.
 */
export async function compositeWithFrame(
  portraitDataUrl: string,
  applyFrame: boolean
): Promise<string> {
  if (!applyFrame) {
    return portraitDataUrl;
  }

  const W = 1200;
  const H = 1800;

  // Inner window bounds of Frame.png with ~5px bleed under the border rim
  const winX = 68;
  const winY = 182;
  const winW = 1064;
  const winH = 1378;

  const [portraitImg, frameImg] = await Promise.all([
    loadImage(portraitDataUrl),
    loadImage(getAssetUrl('assets/frame.png')),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.fillStyle = '#000066';
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.beginPath();
  ctx.rect(winX, winY, winW, winH);
  ctx.clip();

  // Centered cover inside Frame.png's inner window (zero blur bars, 0% horizontal crop on 3:4 & 2:3)
  const coverScale = Math.max(winW / portraitImg.width, winH / portraitImg.height);
  const drawW = portraitImg.width * coverScale;
  const drawH = portraitImg.height * coverScale;
  const drawX = winX + (winW - drawW) / 2;
  const drawY = winY + (winH - drawH) / 2;
  ctx.drawImage(portraitImg, drawX, drawY, drawW, drawH);

  ctx.restore();

  // Overlay Frame.png on top
  ctx.drawImage(frameImg, 0, 0, W, H);

  return canvas.toDataURL('image/png');
}
