import {
  DashboardCloudConfig,
  GenerateIncrementResponse,
  LocalOperatorSettings,
  SettingsSyncResponse,
} from '../types/photobooth';

const DASHBOARD_URL =
  import.meta.env.VITE_DASHBOARD_URL || 'https://ai-photobooth-dashboard-brown.vercel.app';
const PROJECT_ID =
  import.meta.env.VITE_DASHBOARD_PROJECT_ID || '1737edfd-b0b9-492b-a54b-f00b165d9279';

const LOCAL_SETTINGS_STORAGE_KEY = 'digilians_operator_settings_v1';
const CLOUD_CACHE_STORAGE_KEY = 'digilians_cloud_config_cache_v1';

export const DEFAULT_OPERATOR_SETTINGS: LocalOperatorSettings = {
  operatorPassword: '12345',
  previewMode: false,
  imageQuality: 'medium',
  selectedCameraId: '',
  cameraRotation: -90,
  cameraMirror: true,
  enableTestImageUpload: false,
  enablePrinting: true,
  selectedPrinterName: 'Canon SELPHY CP1500',
  printerNames: ['Canon SELPHY CP1500'],
  printCopies: 1,
  autoPrintOnResult: false,
  singlePrintPerSession: true,
  compositeFrameAndLogos: true,
  printFillColor: 'black',
  printScaleDownPercent: 0,
  printTopPaddingPx: 0,
  printBottomPaddingPx: 0,
  printLeftPaddingPx: 0,
  printRightPaddingPx: 0,
  countdownSeconds: 3,
  previewAutoProceedSeconds: 5,
  eraSelectionTimeoutSeconds: 60,
  resultIdleTimeoutSeconds: 120,
  soundEnabled: true,
  kioskLocked: true,
  photoViewerUrl: 'https://photobooth-viewer.vercel.app/?url=',
};

export const DEFAULT_OFFLINE_CLOUD_CONFIG: DashboardCloudConfig = {
  dashboardProjectId: PROJECT_ID,
  projectName: 'Digilians-26-Photobooth',
  isActive: true,
  dailyLimit: 1000,
  currentGenerations: 0,
  projectType: 'desktop',
  cloudinaryAccountId: null,
  cloudinaryAccountLabel: '',
  cloudinaryCloudName: '',
  cloudinaryApiKey: '',
  cloudinaryApiSecret: '',
  cloudinaryFolder: 'Digilians-26-Photobooth',
  aiModelId: null,
  aiModelProvider: 'openai',
  openaiModel: 'gpt-image-2.6-flare',
  aiModelsList: ['gpt-image-2.6-flare'],
  openaiApiKey: '',
  geminiApiKey: '',
  referenceImagesCount: 1,
  totalPrintedCopies: 0,
};

export async function loadLocalOperatorSettings(): Promise<LocalOperatorSettings> {
  if (window.electronAPI?.getOperatorSettings) {
    try {
      const disk = await window.electronAPI.getOperatorSettings();
      if (disk) return { ...DEFAULT_OPERATOR_SETTINGS, ...disk };
    } catch (err) {
      console.warn('[Config] Failed to read operator-settings.json:', err);
    }
  }
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_OPERATOR_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return { ...DEFAULT_OPERATOR_SETTINGS };
}

export async function saveLocalOperatorSettings(
  settings: LocalOperatorSettings
): Promise<{ success: boolean; error?: string }> {
  try {
    localStorage.setItem(LOCAL_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore localStorage quota errors
  }

  if (window.electronAPI?.saveOperatorSettings) {
    return window.electronAPI.saveOperatorSettings(settings);
  }
  return { success: true };
}

async function readCloudCache(): Promise<DashboardCloudConfig | null> {
  if (window.electronAPI?.getCloudConfigCache) {
    try {
      const cached = await window.electronAPI.getCloudConfigCache();
      if (cached) return cached;
    } catch {
      // ignore
    }
  }
  try {
    const raw = localStorage.getItem(CLOUD_CACHE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

async function writeCloudCache(config: DashboardCloudConfig): Promise<void> {
  try {
    localStorage.setItem(CLOUD_CACHE_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // ignore
  }
  if (window.electronAPI?.saveCloudConfigCache) {
    await window.electronAPI.saveCloudConfigCache(config);
  }
}

export async function syncCloudConfig(): Promise<{
  config: DashboardCloudConfig;
  fromCache: boolean;
  syncedAt: string | null;
  error?: string;
}> {
  const url = `${DASHBOARD_URL.replace(/\/$/, '')}/api/projects/${PROJECT_ID}/settings`;
  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const raw: any = await res.json();
    const parsed: DashboardCloudConfig | undefined = raw?.settings ?? raw;
    if (!parsed || (!parsed.dashboardProjectId && !parsed.openaiModel)) {
      throw new Error('Malformed settings response');
    }
    await writeCloudCache(parsed);
    return {
      config: parsed,
      fromCache: false,
      syncedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    console.warn('[Dashboard] GET /settings failed, loading cache:', err?.message || err);
    const cached = await readCloudCache();
    return {
      config: cached || DEFAULT_OFFLINE_CLOUD_CONFIG,
      fromCache: true,
      syncedAt: null,
      error: err?.message || 'Network unavailable',
    };
  }
}

export async function reportPortraitGenerated(
  onCloudStateUpdate?: (
    patch: Pick<DashboardCloudConfig, 'isActive' | 'currentGenerations' | 'dailyLimit'>
  ) => void
): Promise<void> {
  const url = `${DASHBOARD_URL.replace(/\/$/, '')}/api/projects/${PROJECT_ID}/generate`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp: Date.now() }),
    });
    if (!res.ok) return;
    const data: GenerateIncrementResponse = await res.json();
    if (data.success && onCloudStateUpdate) {
      onCloudStateUpdate({
        isActive: data.isActive,
        currentGenerations: data.currentGenerations,
        dailyLimit: data.dailyLimit,
      });
    }
  } catch (err) {
    console.warn('[Dashboard] Failed to report portrait generation:', err);
  }
}

export async function reportPhysicalPrint(copies = 1): Promise<void> {
  const url = `${DASHBOARD_URL.replace(/\/$/, '')}/api/projects/${PROJECT_ID}/print`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ copies: Math.max(1, Math.floor(copies)) }),
    });
  } catch (err) {
    console.warn('[Dashboard] Failed to report printed copies:', err);
  }
}
