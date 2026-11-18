import { FaceDetectionResult } from '../types/photobooth';

const CDN_MODEL_URL = 'https://cdn.jsdelivr.net/gh/cgarciagl/face-api.js@0.22.2/weights';

let loadingPromise: Promise<typeof import('face-api.js')> | undefined;
let activeInference: Promise<FaceDetectionResult | null> | undefined;

/**
 * Dynamically imports face-api.js (without importing @tensorflow/tfjs v4, which
 * collides with face-api.js@0.22.2's bundled tfjs-core and causes `forwardFunc is not a function`)
 * and loads local weights from `./models/` with CDN fallback.
 */
export function loadLocalFaceModels(): Promise<typeof import('face-api.js')> {
  return (loadingPromise ??= (async () => {
    const faceapi = await import('face-api.js');
    const nativeFetch = window.fetch ? window.fetch.bind(window) : undefined;
    try {
      faceapi.env.monkeyPatch({
        fetch: nativeFetch,
        Canvas: HTMLCanvasElement,
        Image: HTMLImageElement,
        createCanvasElement: () => document.createElement('canvas'),
        createImageElement: () => document.createElement('img'),
      });
    } catch (err) {
      console.warn('[FaceDetection] monkeyPatch warning:', err);
    }

    try {
      // @ts-ignore
      await faceapi.tf.setBackend('webgl');
      // @ts-ignore
      await faceapi.tf.ready();
    } catch {
      try {
        // @ts-ignore
        await faceapi.tf.setBackend('cpu');
        // @ts-ignore
        await faceapi.tf.ready();
      } catch (err) {
        console.warn('[FaceDetection] TF backend init warning:', err);
      }
    }

    const directory = new URL(`${import.meta.env.BASE_URL}models/`, window.location.href).href;
    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(directory),
        faceapi.nets.faceLandmark68Net.loadFromUri(directory),
        faceapi.nets.ageGenderNet.loadFromUri(directory),
      ]);
      console.info('[FaceDetection] Local models loaded from:', directory);
    } catch {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(CDN_MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(CDN_MODEL_URL),
        faceapi.nets.ageGenderNet.loadFromUri(CDN_MODEL_URL),
      ]);
      console.info('[FaceDetection] Models loaded from CDN fallback');
    }
    return faceapi;
  })());
}

export async function loadFaceModels(): Promise<boolean> {
  try {
    await loadLocalFaceModels();
    return true;
  } catch (err) {
    console.warn('[FaceDetection] Could not load face-api models:', err);
    loadingPromise = undefined;
    return false;
  }
}

export async function detectFaces(
  source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
): Promise<FaceDetectionResult | null> {
  if (activeInference) return null;

  const task = (async (): Promise<FaceDetectionResult | null> => {
    try {
      const faceapi = await loadLocalFaceModels();
      const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.35 });
      const results = await faceapi
        .detectAllFaces(source, options)
        .withFaceLandmarks()
        .withAgeAndGender();

      if (!results.length) return null;

      let maleCount = 0;
      let femaleCount = 0;
      let childCount = 0;
      let unknownCount = 0;

      results.forEach((res: any) => {
        const prob = typeof res.genderProbability === 'number' ? res.genderProbability : 1;
        const age = res.age ? Math.round(res.age) : 25;

        if (age < 15) {
          childCount++;
        } else if (prob < 0.65) {
          unknownCount++;
        } else if (res.gender === 'male') {
          maleCount++;
        } else {
          femaleCount++;
        }
      });

      return {
        maleCount,
        femaleCount,
        childCount,
        unknownCount,
        totalPeople: results.length,
      };
    } catch (err) {
      console.warn('[FaceDetection] Error during detection, falling back to vision:', err);
      return null;
    } finally {
      activeInference = undefined;
    }
  })();

  activeInference = task;
  return task;
}
