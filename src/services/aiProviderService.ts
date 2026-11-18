import { DashboardCloudConfig, FaceDetectionResult } from '../types/photobooth';

export interface GeneratePortraitParams {
  capturedDataUrl: string;
  prompt: string;
  cloudConfig: DashboardCloudConfig;
  imageQuality: 'low' | 'medium' | 'high';
  pathName: string;
  variationName: string;
  faceSummary: FaceDetectionResult | null;
  signal?: AbortSignal;
}

function dataUrlToBlob(dataUrl: string): { blob: Blob; mimeType: string; base64Data: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('Invalid image data URL');
  const mimeType = match[1];
  const base64Data = match[2];
  const binary = atob(base64Data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return { blob: new Blob([bytes], { type: mimeType }), mimeType, base64Data };
}

export async function generatePortrait(params: GeneratePortraitParams): Promise<string> {
  const {
    capturedDataUrl,
    prompt,
    cloudConfig,
    imageQuality,
    pathName,
    variationName,
    faceSummary,
    signal,
  } = params;

  const provider = cloudConfig.aiModelProvider || 'openai';
  const model = cloudConfig.openaiModel || 'gpt-image-2.6-flare';

  console.group(`[AI Generation] ${provider.toUpperCase()} · ${model}`);
  console.log('Path:', pathName);
  console.log('Variation:', variationName);
  if (provider === 'openai') console.log('Quality:', imageQuality);
  console.log('Face Summary:', faceSummary || 'Vision fallback');
  console.log('Prompt:\n' + prompt);
  console.groupEnd();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180_000);
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener('abort', onExternalAbort);

  try {
    if (provider === 'gemini') {
      if (!cloudConfig.geminiApiKey) {
        throw new Error('Gemini API key not configured on Dashboard.');
      }
      const { mimeType, base64Data } = dataUrlToBlob(capturedDataUrl);
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': cloudConfig.geminiApiKey,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          input: [
            { type: 'text', text: prompt },
            { type: 'image', mime_type: mimeType, data: base64Data },
          ],
          response_format: {
            type: 'image',
            mime_type: 'image/jpeg',
            aspect_ratio: '3:4',
            image_size: '1K',
          },
          generation_config: { thinking_level: 'minimal' },
          store: false,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini HTTP ${res.status}: ${errText}`);
      }

      const data = await res.json();
      const modelSteps = (data?.steps || []).filter((s: any) => s.type === 'model_output');
      const allParts = modelSteps.flatMap((s: any) => s.parts || s.outputs || []);
      const imageParts = allParts.filter((p: any) => p.type === 'image' && p.data);
      const lastImg = imageParts[imageParts.length - 1];
      if (!lastImg?.data) {
        throw new Error('Gemini response did not contain an image.');
      }
      const outMime = lastImg.mime_type || 'image/jpeg';
      return `data:${outMime};base64,${lastImg.data}`;
    }

    // OpenAI Images Edit Adapter
    if (!cloudConfig.openaiApiKey) {
      throw new Error('OpenAI API key not configured on Dashboard.');
    }
    const { blob, mimeType } = dataUrlToBlob(capturedDataUrl);
    const ext = mimeType.includes('png') ? 'png' : 'jpg';

    const formData = new FormData();
    formData.append('model', model);
    formData.append('prompt', prompt);
    formData.append('image[]', blob, `capture.${ext}`);
    formData.append('size', '1024x1536');
    formData.append('output_format', 'png');
    formData.append('n', '1');
    formData.append('quality', imageQuality || 'medium');

    if (model === 'gpt-image-1.5') {
      formData.append('input_fidelity', 'high');
    }

    const res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cloudConfig.openaiApiKey}`,
      },
      signal: controller.signal,
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json;
    const url = data?.data?.[0]?.url;
    if (b64) {
      return `data:image/png;base64,${b64}`;
    }
    if (url) {
      const imgRes = await fetch(url, { signal: controller.signal });
      const imgBlob = await imgRes.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Failed to read OpenAI image URL'));
        reader.readAsDataURL(imgBlob);
      });
    }
    throw new Error('OpenAI response did not contain an image.');
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onExternalAbort);
  }
}
