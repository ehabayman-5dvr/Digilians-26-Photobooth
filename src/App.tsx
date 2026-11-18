import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  DashboardCloudConfig,
  FaceDetectionResult,
  Language,
  LearningPathConfig,
  LocalOperatorSettings,
  PathId,
  ScreenId,
} from './types/photobooth';
import { LEARNING_PATHS, getPathById } from './data/pathsConfig';
import {
  DEFAULT_OFFLINE_CLOUD_CONFIG,
  DEFAULT_OPERATOR_SETTINGS,
  loadLocalOperatorSettings,
  reportPortraitGenerated,
  saveLocalOperatorSettings,
  syncCloudConfig,
} from './services/configService';
import { loadFaceModels } from './services/faceDetectionService';
import { craftPhotoboothPrompt } from './services/promptCraftingService';
import { generatePortrait } from './services/aiProviderService';
import { compositeWithFrame } from './services/compositorService';
import { uploadPortraitToCloudinary } from './services/cloudinaryService';
import { generatePhotoboothQrCode } from './services/qrService';
import { setSoundEnabled } from './services/soundService';

import { SplashScreen } from './screens/SplashScreen';
import { PathSelectionScreen } from './screens/PathSelectionScreen';
import { CameraScreen } from './screens/CameraScreen';
import { PreviewScreen } from './screens/PreviewScreen';
import { LoadingScreen } from './screens/LoadingScreen';
import { ResultScreen } from './screens/ResultScreen';
import { OperatorModal } from './components/OperatorModal';
import { CustomCursor } from './components/CustomCursor';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenId>('splash');
  const [language, setLanguage] = useState<Language>('en');
  const [selectedPath, setSelectedPath] = useState<LearningPathConfig>(LEARNING_PATHS[2]);
  const [variationIndices, setVariationIndices] = useState<Record<PathId, number>>({
    ai_software: 0,
    applied_ai: 0,
    ai_data_science: 0,
    digital_arts: 0,
    cybersecurity: 0,
  });

  const [cloudConfig, setCloudConfig] = useState<DashboardCloudConfig>(DEFAULT_OFFLINE_CLOUD_CONFIG);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [cloudSyncError, setCloudSyncError] = useState<string | null>(null);
  const [localSettings, setLocalSettings] = useState<LocalOperatorSettings>(
    DEFAULT_OPERATOR_SETTINGS
  );

  const [adminOpen, setAdminOpen] = useState(false);
  const [scale, setScale] = useState(1);

  // Session state
  const [capturedDataUrl, setCapturedDataUrl] = useState<string>('');
  const facePromiseRef = useRef<Promise<FaceDetectionResult | null> | null>(null);
  const [finalImageUrl, setFinalImageUrl] = useState<string>('');
  const [lastPrompt, setLastPrompt] = useState<string>('');
  const [genError, setGenError] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  const sessionTokenRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hotTapRef = useRef<{ count: number; lastAt: number }>({ count: 0, lastAt: 0 });

  // Scale 1080x1920 kiosk stage cleanly to any viewport
  useEffect(() => {
    const updateScale = () => {
      const s = Math.min(window.innerWidth / 1080, window.innerHeight / 1920);
      setScale(s > 0 ? s : 1);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const refreshCloud = useCallback(async () => {
    const res = await syncCloudConfig();
    setCloudConfig(res.config);
    setLastSyncedAt(res.syncedAt);
    setCloudSyncError(res.error || null);
  }, []);

  // Boot initialization
  useEffect(() => {
    void loadLocalOperatorSettings().then((s) => {
      setLocalSettings(s);
      setSoundEnabled(s.soundEnabled !== false);
    });
    void refreshCloud();
    void loadFaceModels();

    const interval = window.setInterval(() => {
      void refreshCloud();
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [refreshCloud]);

  // F2 Operator Modal listener (Electron IPC + browser keyboard fallback)
  useEffect(() => {
    const unsub = window.electronAPI?.onToggleAdmin?.(() => {
      setAdminOpen((prev) => !prev);
    });
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      unsub?.();
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleHotZoneTap = () => {
    const now = Date.now();
    if (now - hotTapRef.current.lastAt > 2000) {
      hotTapRef.current = { count: 1, lastAt: now };
    } else {
      hotTapRef.current = { count: hotTapRef.current.count + 1, lastAt: now };
    }
    if (hotTapRef.current.count >= 5) {
      hotTapRef.current.count = 0;
      setAdminOpen(true);
    }
  };

  const resetToSplash = useCallback(() => {
    sessionTokenRef.current++;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setCapturedDataUrl('');
    setFinalImageUrl('');
    setQrCodeDataUrl(null);
    setQrError(null);
    setQrLoading(false);
    setGenError(null);
    setScreen('splash');
  }, []);

  const uploadAndGenerateQr = useCallback(
    async (imageToShare: string, promptText: string, pathId: PathId, token: number) => {
      setQrLoading(true);
      setQrError(null);
      try {
        const secureUrl = await uploadPortraitToCloudinary(
          imageToShare,
          cloudConfig,
          promptText,
          pathId
        );
        if (sessionTokenRef.current !== token) return;
        const qrData = await generatePhotoboothQrCode(
          secureUrl,
          localSettings.photoViewerUrl
        );
        if (sessionTokenRef.current !== token) return;
        setQrCodeDataUrl(qrData);
      } catch (err: any) {
        if (sessionTokenRef.current !== token) return;
        setQrError(err?.message || 'Upload failed');
      } finally {
        if (sessionTokenRef.current === token) {
          setQrLoading(false);
        }
      }
    },
    [cloudConfig, localSettings.photoViewerUrl]
  );

  const runGenerationPipeline = useCallback(async () => {
    const token = ++sessionTokenRef.current;
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setGenError(null);
    setQrCodeDataUrl(null);
    setQrError(null);

    try {
      const faceSummary = facePromiseRef.current
        ? await facePromiseRef.current.catch(() => null)
        : null;

      if (sessionTokenRef.current !== token) return;

      const currentIdx = variationIndices[selectedPath.id] || 0;
      const crafted = craftPhotoboothPrompt(
        selectedPath,
        currentIdx,
        faceSummary,
        'ornate_frame',
        true
      );
      setLastPrompt(crafted.prompt);

      let rawPortrait: string;
      if (localSettings.previewMode) {
        await new Promise((r) => setTimeout(r, 1500));
        rawPortrait = capturedDataUrl;
      } else {
        rawPortrait = await generatePortrait({
          capturedDataUrl,
          prompt: crafted.prompt,
          cloudConfig,
          imageQuality: localSettings.imageQuality,
          pathName: selectedPath.nameEn,
          variationName: crafted.scene.name,
          faceSummary,
          signal: controller.signal,
        });
      }

      if (sessionTokenRef.current !== token) return;

      const composited = await compositeWithFrame(
        rawPortrait,
        localSettings.compositeFrameAndLogos
      );

      if (sessionTokenRef.current !== token) return;

      // Advance variation index sequentially only on success
      setVariationIndices((prev) => ({
        ...prev,
        [selectedPath.id]: (currentIdx + 1) % selectedPath.scenes.length,
      }));

      setFinalImageUrl(composited);
      void window.electronAPI?.saveLocalPhoto?.({
        dataUrl: composited,
        type: 'final',
        eraId: selectedPath.id,
      });

      if (!localSettings.previewMode) {
        void reportPortraitGenerated((patch) => {
          setCloudConfig((prev) => ({ ...prev, ...patch }));
        });
      }

      setScreen('result');

      // Asynchronous upload + QR generation (never blocks Result screen)
      void uploadAndGenerateQr(composited, crafted.prompt, selectedPath.id, token);
    } catch (err: any) {
      if (sessionTokenRef.current !== token) return;
      if (err?.name === 'AbortError') return;
      setGenError(err?.message || 'Generation failed');
    }
  }, [
    capturedDataUrl,
    cloudConfig,
    localSettings.compositeFrameAndLogos,
    localSettings.imageQuality,
    localSettings.previewMode,
    selectedPath,
    uploadAndGenerateQr,
    variationIndices,
  ]);

  const handleSelectPath = (path: LearningPathConfig) => {
    if (path.id !== selectedPath.id) {
      setVariationIndices((prev) => ({ ...prev, [path.id]: 0 }));
    }
    setSelectedPath(path);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000028',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: 1080,
          height: 1920,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
          position: 'relative',
          boxShadow: '0 0 120px rgba(0,0,0,0.85)',
        }}
      >
        {screen === 'splash' && (
          <SplashScreen
            cloudConfig={cloudConfig}
            onSelectLanguage={(lang) => {
              setLanguage(lang);
              setScreen('path_selection');
            }}
            onHotZoneTap={handleHotZoneTap}
          />
        )}

        {screen === 'path_selection' && (
          <PathSelectionScreen
            language={language}
            selectedPathId={selectedPath.id}
            timeoutSeconds={localSettings.eraSelectionTimeoutSeconds}
            onSelectPath={handleSelectPath}
            onContinue={(path) => {
              handleSelectPath(path);
              setScreen('capture');
            }}
            onBack={resetToSplash}
          />
        )}

        {screen === 'capture' && (
          <CameraScreen
            language={language}
            selectedPath={selectedPath}
            operatorSettings={localSettings}
            onPhotoCaptured={(dataUrl, facePromise) => {
              setCapturedDataUrl(dataUrl);
              facePromiseRef.current = facePromise;
              setScreen('preview');
            }}
            onBack={() => setScreen('path_selection')}
          />
        )}

        {screen === 'preview' && (
          <PreviewScreen
            language={language}
            selectedPath={selectedPath}
            capturedDataUrl={capturedDataUrl}
            autoProceedSeconds={localSettings.previewAutoProceedSeconds}
            onRetake={() => setScreen('capture')}
            onProceed={() => {
              setScreen('loading');
              void runGenerationPipeline();
            }}
          />
        )}

        {screen === 'loading' && (
          <LoadingScreen
            language={language}
            selectedPath={selectedPath}
            errorMessage={genError}
            onRetry={() => void runGenerationPipeline()}
            onRetake={() => {
              setGenError(null);
              setScreen('capture');
            }}
          />
        )}

        {screen === 'result' && (
          <ResultScreen
            language={language}
            selectedPath={selectedPath}
            finalImageUrl={finalImageUrl}
            qrCodeDataUrl={qrCodeDataUrl}
            qrLoading={qrLoading}
            qrError={qrError}
            operatorSettings={localSettings}
            onRetryUpload={() =>
              void uploadAndGenerateQr(
                finalImageUrl,
                lastPrompt,
                selectedPath.id,
                sessionTokenRef.current
              )
            }
            onTryAnotherPath={() => {
              sessionTokenRef.current++;
              setScreen('path_selection');
            }}
            onDone={resetToSplash}
          />
        )}
      </div>

      <OperatorModal
        isOpen={adminOpen}
        cloudConfig={cloudConfig}
        lastSyncedAt={lastSyncedAt}
        cloudSyncError={cloudSyncError}
        localSettings={localSettings}
        onSyncCloudNow={refreshCloud}
        onSaveLocalSettings={async (next) => {
          const res = await saveLocalOperatorSettings(next);
          if (res.success) {
            setLocalSettings(next);
            setSoundEnabled(next.soundEnabled !== false);
          }
          return res;
        }}
        onClose={() => setAdminOpen(false)}
      />

      <CustomCursor />
    </div>
  );
};

export default App;
