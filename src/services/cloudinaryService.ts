import { DashboardCloudConfig } from '../types/photobooth';

export function buildCloudinaryContextString(
  fullPrompt?: string,
  extra?: Record<string, string | undefined>
): string {
  const sanitize = (str: string) =>
    str.replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/=/g, '\\=');

  const pairs: string[] = [];
  const trimmed = (fullPrompt || '').trim();
  if (trimmed) {
    const chunkSize = 900;
    for (let i = 0; i < trimmed.length; i += chunkSize) {
      const idx = Math.floor(i / chunkSize);
      pairs.push(`prompt_${idx}=${sanitize(trimmed.slice(i, i + chunkSize))}`);
    }
  }

  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v && k !== 'prompt') {
        pairs.push(`${k}=${sanitize(v)}`);
      }
    }
  }

  return pairs.join('|');
}

async function generateSha1Hex(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function uploadOnce(
  imageBase64: string,
  cloudConfig: DashboardCloudConfig,
  fullPrompt: string,
  era?: string
): Promise<string> {
  const { cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret, cloudinaryFolder } =
    cloudConfig;

  if (!cloudinaryCloudName || !cloudinaryApiKey || !cloudinaryApiSecret || !cloudinaryFolder) {
    throw new Error('Missing Cloudinary credentials in cloudConfig');
  }

  if (window.electronAPI?.uploadToCloudinary) {
    const res = await window.electronAPI.uploadToCloudinary({
      imageBase64,
      cloudName: cloudinaryCloudName,
      apiKey: cloudinaryApiKey,
      apiSecret: cloudinaryApiSecret,
      folder: cloudinaryFolder,
      fullPrompt,
      era,
    });
    if (!res.success || !res.secureUrl) {
      throw new Error(res.error || 'Electron Cloudinary upload failed');
    }
    return res.secureUrl;
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const context = buildCloudinaryContextString(fullPrompt, era ? { era } : undefined);

  const paramsToSign: Record<string, string> = {
    folder: cloudinaryFolder,
    tags: cloudinaryFolder,
    timestamp,
  };
  if (context) paramsToSign.context = context;

  const sortedString = Object.keys(paramsToSign)
    .sort()
    .map((k) => `${k}=${paramsToSign[k]}`)
    .join('&');

  const signature = await generateSha1Hex(`${sortedString}${cloudinaryApiSecret}`);

  const formData = new FormData();
  formData.append('file', imageBase64);
  formData.append('api_key', cloudinaryApiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', cloudinaryFolder);
  formData.append('tags', cloudinaryFolder);
  if (context) formData.append('context', context);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Cloudinary HTTP ${res.status}: ${errText}`);
  }

  const data = await res.json();
  if (!data?.secure_url) {
    throw new Error('Cloudinary response missing secure_url');
  }
  return data.secure_url;
}

export async function uploadPortraitToCloudinary(
  imageBase64: string,
  cloudConfig: DashboardCloudConfig,
  fullPrompt: string,
  era?: string
): Promise<string> {
  const delays = [2000, 4000, 8000];
  let lastError: unknown;

  for (let attempt = 0; attempt < delays.length; attempt++) {
    try {
      return await uploadOnce(imageBase64, cloudConfig, fullPrompt, era);
    } catch (err) {
      lastError = err;
      if (attempt < delays.length - 1) {
        await new Promise((r) => setTimeout(r, delays[attempt]));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Cloudinary upload failed');
}
