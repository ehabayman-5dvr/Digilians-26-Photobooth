import QRCode from 'qrcode';

export interface QrCodeOptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
}

export async function generatePhotoboothQrCode(
  imageUrl: string,
  viewerBaseUrl = 'https://photobooth-viewer.vercel.app/?url=',
  options: QrCodeOptions = {}
): Promise<string> {
  const {
    width = 512,
    margin = 2,
    darkColor = '#0B0C17',
    lightColor = '#FFFFFF',
  } = options;

  const base = viewerBaseUrl.includes('?url=')
    ? viewerBaseUrl
    : `${viewerBaseUrl.replace(/\/$/, '')}/?url=`;
  const targetViewerUrl = `${base}${encodeURIComponent(imageUrl)}&branded=true`;

  try {
    return await QRCode.toDataURL(targetViewerUrl, {
      width,
      margin,
      color: {
        dark: darkColor,
        light: lightColor,
      },
      errorCorrectionLevel: 'M',
    });
  } catch (error) {
    console.warn('[QR Generator] Local QRCode generation failed, using fallback:', error);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${width}x${width}&margin=${margin}&data=${encodeURIComponent(
      targetViewerUrl
    )}`;
  }
}
