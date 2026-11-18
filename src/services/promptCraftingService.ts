import {
  FaceDetectionResult,
  FramingMode,
  LearningPathConfig,
  OutfitVariation,
  SceneVariation,
} from '../types/photobooth';

export function buildSubjectDirective(summary: FaceDetectionResult | null): string {
  if (!summary || summary.totalPeople < 1 || summary.totalPeople > 50) {
    return 'Local face analysis is unavailable or inconclusive. Inspect IMAGE 1 directly using vision to determine the exact people count, ages, genders, and whether any woman wears a hijab or has uncovered hair, and preserve EVERY visible participant from IMAGE 1.';
  }

  const parts: string[] = [];
  if (summary.maleCount > 0) parts.push(`${summary.maleCount} man/men`);
  if (summary.femaleCount > 0) parts.push(`${summary.femaleCount} woman/women`);
  if (summary.childCount > 0) parts.push(`${summary.childCount} child/children`);
  if (summary.unknownCount > 0) parts.push(`${summary.unknownCount} additional person(s)`);

  return `Local face analysis detected at least ${summary.totalPeople} person(s) (${parts.join(', ')}). IMAGE 1 is the SOLE authority for the true headcount: visually inspect IMAGE 1 and include 100% of visible participants without omitting anyone.`;
}

export function buildCompositionDirective(
  framingMode: FramingMode,
  isPrintedKiosk: boolean
): string {
  if (framingMode === 'ornate_frame') {
    return 'COMPOSITION & SAFE AREA: Output a single coherent 2:3 vertical portrait, never a collage. Keep all faces and headwear inside the central safe area, at least 15% from the top edge and 12% from the side edges to leave room for the custom overlay frame. Use natural skin texture, convincing ground/seat contact shadows, print-friendly brightness, and anatomically accurate hands. No added text, dates, logos, watermarks, or borders—the frame will be applied separately.';
  }
  if (framingMode === 'logo_only') {
    return 'COMPOSITION & SAFE AREA: Output a single coherent 2:3 vertical portrait, never a collage. Use natural portrait framing with ~8% top headroom above heads/hair and keep key props clear of the logo badge area. Use natural skin texture, convincing contact shadows, and anatomically accurate hands. No added text, dates, watermarks, or borders.';
  }
  return `COMPOSITION & SAFE AREA: Output a single coherent 2:3 vertical full-bleed portrait, never a collage. ${
    isPrintedKiosk
      ? 'Keep ~6% breathing room from the outer edges to account for borderless printer overscan.'
      : 'Frame subjects naturally across the full portrait canvas with comfortable headroom.'
  } Use natural skin texture, convincing contact shadows, and anatomically accurate hands. No added text, dates, logos, watermarks, or borders.`;
}

export interface CraftedPromptPayload {
  prompt: string;
  scene: SceneVariation;
  outfit: OutfitVariation;
  variationIndex: number;
}

/**
 * Assembles the standardized 7-block test prompt for Digilians-26.
 * (Short test prompts for initial scaffolding; will be refined in prompting phase.)
 */
export function craftPhotoboothPrompt(
  path: LearningPathConfig,
  variationIndex: number,
  faceSummary: FaceDetectionResult | null,
  framingMode: FramingMode = 'ornate_frame',
  isPrintedKiosk = true
): CraftedPromptPayload {
  const safeIdx = variationIndex % path.scenes.length;
  const scene = path.scenes[safeIdx];
  const outfit = path.outfits[safeIdx % path.outfits.length];

  const blocks = [
    // 1. Input Image Roles (1-image mode)
    `INPUT IMAGE ROLE: IMAGE 1 is the guest capture photo and the SOLE identity reference for all participants, their exact faces, ages, genders, and headcoverings.`,

    // 2. Soft-Hint Subject Directive
    `SUBJECTS: ${buildSubjectDirective(faceSummary)}`,

    // 3. 1:1 Facial Identity Lock
    `1:1 FACIAL IDENTITY LOCK: Preserve each person's exact facial structure, skin tone, eyes, nose, mouth, glasses, facial hair, and natural expression from IMAGE 1 with zero beautification, morphing, or face averaging.`,

    // 4. Wardrobe & Headwear
    `WARDROBE (${outfit.name} — ${outfit.style}): Dress participants in ${outfit.description} ${outfit.femaleNotes || ''}`,

    // 5. Strict Modesty & Headcover Mandate
    `MODESTY & HEADCOVER MANDATE: Ensure 100% opaque chest, torso, and shoulder coverage for every man, woman, and child; never shirtless or sheer. Preserve hijab/headcover if present in IMAGE 1, and never add a hijab if absent in IMAGE 1.`,

    // 6. Pose & Props
    `POSE (${scene.name}): ${scene.poseDirective || 'Natural confident portrait facing the camera.'}`,

    // 7. Environment + Conditional Safe Area
    `ENVIRONMENT (${path.nameEn} — ${scene.landmark}): ${scene.description} Lighting: ${scene.lighting}\n${buildCompositionDirective(
      framingMode,
      isPrintedKiosk
    )}`,
  ];

  return {
    prompt: blocks.join('\n\n'),
    scene,
    outfit,
    variationIndex: safeIdx,
  };
}
