export type Language = 'ar' | 'en';

export type ScreenId =
  | 'splash'
  | 'path_selection'
  | 'capture'
  | 'preview'
  | 'loading'
  | 'result';

export type PathId =
  | 'ai_software'
  | 'applied_ai'
  | 'ai_data_science'
  | 'digital_arts'
  | 'cybersecurity';

export type FramingMode = 'ornate_frame' | 'logo_only' | 'unframed';

export interface DashboardCloudConfig {
  dashboardProjectId: string;
  projectName: string;
  isActive: boolean;
  dailyLimit: number;
  currentGenerations: number;
  projectType: 'desktop' | 'web';
  cloudinaryAccountId: string | null;
  cloudinaryAccountLabel: string;
  cloudinaryCloudName: string;
  cloudinaryApiKey: string;
  cloudinaryApiSecret: string;
  cloudinaryFolder: string;
  aiModelId: string | null;
  aiModelProvider: 'openai' | 'gemini';
  openaiModel: string;
  aiModelsList: string[];
  openaiApiKey: string;
  geminiApiKey: string;
  referenceImagesCount: number;
  totalPrintedCopies: number;
}

export interface SettingsSyncResponse {
  projectId: string;
  updatedAt?: string;
  settings: DashboardCloudConfig;
}

export interface GenerateIncrementResponse {
  success: boolean;
  projectId: string;
  incrementedBy: number;
  isActive: boolean;
  currentGenerations: number;
  dailyLimit: number;
  remaining: number;
  timestamp: string;
}

export interface LocalOperatorSettings {
  operatorPassword: string;
  previewMode: boolean;
  imageQuality: 'low' | 'medium' | 'high';
  selectedCameraId: string;
  cameraRotation: -90 | 0 | 90 | 180;
  cameraMirror: boolean;
  enableTestImageUpload: boolean;
  enablePrinting: boolean;
  selectedPrinterName: string;
  printerNames: string[];
  printCopies: number;
  autoPrintOnResult: boolean;
  singlePrintPerSession: boolean;
  compositeFrameAndLogos: boolean;
  printFillColor: string;
  printScaleDownPercent: number;
  printTopPaddingPx: number;
  printBottomPaddingPx: number;
  printLeftPaddingPx: number;
  printRightPaddingPx: number;
  countdownSeconds: number;
  previewAutoProceedSeconds: number;
  eraSelectionTimeoutSeconds: number;
  resultIdleTimeoutSeconds: number;
  soundEnabled: boolean;
  kioskLocked: boolean;
  photoViewerUrl: string;
}

export interface FaceDetectionResult {
  maleCount: number;
  femaleCount: number;
  childCount: number;
  unknownCount: number;
  totalPeople: number;
}

export interface SceneVariation {
  id: string;
  name: string;
  nameAr: string;
  landmark: string;
  description: string;
  lighting: string;
  poseDirective?: string;
  referenceImage?: string;
}

export interface OutfitVariation {
  id: string;
  name: string;
  style: string;
  description: string;
  femaleNotes?: string;
}

export interface LearningPathConfig {
  id: PathId;
  order: number;
  nameEn: string;
  nameAr: string;
  taglineEn: string;
  taglineAr: string;
  accent: string;
  cardImage: string;
  loadingBadgeEn: string;
  loadingBadgeAr: string;
  loadingVideo?: string;
  loadingTheme: 'neural' | 'digital_arts' | 'cybersecurity' | 'software' | 'data';
  milestones: Array<{ ar: string; en: string }>;
  scenes: SceneVariation[];
  outfits: OutfitVariation[];
}

export interface PrinterDeviceInfo {
  name: string;
  displayName: string;
  isDefault: boolean;
  status: number;
}

export interface ElectronAPI {
  isElectron: boolean;
  onToggleAdmin: (callback: () => void) => () => void;
  getOperatorSettings: () => Promise<Partial<LocalOperatorSettings> | null>;
  saveOperatorSettings: (settings: LocalOperatorSettings) => Promise<{ success: boolean; error?: string }>;
  getCloudConfigCache: () => Promise<DashboardCloudConfig | null>;
  saveCloudConfigCache: (config: DashboardCloudConfig) => Promise<{ success: boolean; error?: string }>;
  exitKiosk: () => Promise<void>;
  enterKiosk: () => Promise<void>;
  relaunchApp: () => Promise<void>;
  pickTestImage: () => Promise<{ dataUrl: string; fileName: string } | null>;
  saveLocalPhoto: (payload: { dataUrl: string; type: 'raw' | 'final'; eraId: string }) => Promise<{ success: boolean; path?: string; error?: string }>;
  getPrinters: () => Promise<PrinterDeviceInfo[]>;
  printPhoto: (payload: {
    imageBase64: string;
    printerName?: string;
    copies?: number;
    printFillColor?: string;
    printScaleDownPercent?: number;
    printTopPaddingPx?: number;
    printBottomPaddingPx?: number;
    printLeftPaddingPx?: number;
    printRightPaddingPx?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  clearPrinterQueue?: (printerName?: string) => Promise<{ success: boolean; error?: string }>;
  uploadToCloudinary: (payload: {
    imageBase64: string;
    cloudName: string;
    apiKey: string;
    apiSecret: string;
    folder: string;
    fullPrompt: string;
    era?: string;
  }) => Promise<{ success: boolean; secureUrl?: string; publicId?: string; error?: string }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
