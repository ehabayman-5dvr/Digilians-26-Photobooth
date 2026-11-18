import React, { useEffect, useRef, useState } from 'react';
import {
  FaceDetectionResult,
  Language,
  LearningPathConfig,
  LocalOperatorSettings,
} from '../types/photobooth';
import { getStrings, toLocaleDigits } from '../data/i18n';
import { detectFaces } from '../services/faceDetectionService';
import { playCountdownBeep, playShutter, playTap } from '../services/soundService';

interface CameraScreenProps {
  language: Language;
  selectedPath: LearningPathConfig;
  operatorSettings: LocalOperatorSettings;
  onPhotoCaptured: (
    dataUrl: string,
    facePromise: Promise<FaceDetectionResult | null>
  ) => void;
  onBack: () => void;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({
  language,
  selectedPath,
  operatorSettings,
  onPhotoCaptured,
  onBack,
}) => {
  const isAr = language === 'ar';
  const t = getStrings(language);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [phase, setPhase] = useState<'idle' | 'count' | 'flash'>('idle');
  const [count, setCount] = useState<number>(operatorSettings.countdownSeconds || 3);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function startCamera() {
      setCameraError(null);
      try {
        const constraints: MediaStreamConstraints = {
          video: operatorSettings.selectedCameraId
            ? { deviceId: { exact: operatorSettings.selectedCameraId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
            : { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'user' },
          audio: false,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        if (!cancelled) {
          setCameraError(err?.message || 'Camera unavailable');
        }
      }
    }
    startCamera();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    };
  }, [operatorSettings.selectedCameraId]);

  const captureUprightFrame = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const targetW = 1080;
    const targetH = 1920;
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rot = operatorSettings.cameraRotation ?? -90;
    const mirror = operatorSettings.cameraMirror ?? true;

    ctx.save();
    ctx.translate(targetW / 2, targetH / 2);
    if (mirror) ctx.scale(-1, 1);
    ctx.rotate((rot * Math.PI) / 180);

    const isSideways = Math.abs(rot) === 90;
    const drawTargetW = isSideways ? targetH : targetW;
    const drawTargetH = isSideways ? targetW : targetH;

    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const scale = Math.max(drawTargetW / vw, drawTargetH / vh);
    const dw = vw * scale;
    const dh = vh * scale;
    ctx.drawImage(video, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const facePromise = detectFaces(canvas);
    void window.electronAPI?.saveLocalPhoto?.({
      dataUrl,
      type: 'raw',
      eraId: selectedPath.id,
    });
    onPhotoCaptured(dataUrl, facePromise);
  };

  const handleUploadedFileDataUrl = (rawDataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const targetW = 1080;
      const targetH = 1920;
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const isPortrait = img.height >= img.width;
      if (isPortrait) {
        const scale = Math.max(targetW / img.width, targetH / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(img, (targetW - dw) / 2, (targetH - dh) / 2, dw, dh);
      } else {
        // Blurred darkened cover backdrop + centered contain foreground
        ctx.save();
        ctx.filter = 'blur(24px) brightness(0.45)';
        const bgScale = Math.max(targetW / img.width, targetH / img.height);
        const bw = img.width * bgScale;
        const bh = img.height * bgScale;
        ctx.drawImage(img, (targetW - bw) / 2, (targetH - bh) / 2, bw, bh);
        ctx.restore();

        const fgScale = Math.min(targetW / img.width, targetH / img.height);
        const fw = img.width * fgScale;
        const fh = img.height * fgScale;
        ctx.drawImage(img, (targetW - fw) / 2, (targetH - fh) / 2, fw, fh);
      }

      const uprightUrl = canvas.toDataURL('image/jpeg', 0.95);
      const facePromise = detectFaces(canvas);
      void window.electronAPI?.saveLocalPhoto?.({
        dataUrl: uprightUrl,
        type: 'raw',
        eraId: selectedPath.id,
      });

      setPhase('flash');
      setTimeout(() => {
        onPhotoCaptured(uprightUrl, facePromise);
      }, 250);
    };
    img.src = rawDataUrl;
  };

  const triggerTestUpload = async () => {
    if (window.electronAPI?.pickTestImage) {
      const picked = await window.electronAPI.pickTestImage();
      if (picked?.dataUrl) {
        handleUploadedFileDataUrl(picked.dataUrl);
      }
      return;
    }
    fileInputRef.current?.click();
  };

  const startCountdown = () => {
    if (phase !== 'idle') return;
    const total = Math.max(1, operatorSettings.countdownSeconds || 3);

    const tick = (n: number) => {
      if (n === 0) {
        playShutter();
        setPhase('flash');
        captureUprightFrame();
        return;
      }
      playCountdownBeep(n === 1);
      setPhase('count');
      setCount(n);
      window.setTimeout(() => tick(n - 1), 1000);
    };
    tick(total);
  };

  const rot = operatorSettings.cameraRotation ?? -90;
  const isSideways = Math.abs(rot) === 90;
  const mirrorTransform = operatorSettings.cameraMirror ? 'scaleX(-1) ' : '';

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        width: 1080,
        height: 1920,
        position: 'relative',
        overflow: 'hidden',
        background: '#000066',
        color: '#FFFFFF',
        fontFamily: isAr ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
      }}
    >
      {/* Clean Live Camera Viewport (no face-align HUD) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) ${mirrorTransform}rotate(${rot}deg)`,
          width: isSideways ? 1920 : 1080,
          height: isSideways ? 1080 : 1920,
          objectFit: 'cover',
        }}
      />

      {/* Subtle top & bottom gradient scrims */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,40,0.68) 0%, rgba(0,0,40,0) 22%, rgba(0,0,40,0) 75%, rgba(0,0,40,0.8) 100%)',
          pointerEvents: 'none',
        }}
      />

      {cameraError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            background: 'rgba(0,0,50,0.85)',
            padding: 48,
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: 34, fontWeight: 700, color: '#FFD1D1' }}>
            {cameraError}
          </span>
          <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.75)' }}>
            Connect a camera or enable Test Image Upload in F2 Operator Settings.
          </span>
        </div>
      )}

      {/* Top Bar: Back */}
      <div
        style={{
          position: 'absolute',
          left: 56,
          right: 56,
          top: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          direction: 'ltr',
          zIndex: 20,
        }}
      >
        <button
          type="button"
          className="dg-btn-glass"
          onClick={() => {
            playTap();
            onBack();
          }}
          style={{
            height: 82,
            padding: '0 32px',
            borderRadius: 999,
            border: '1.5px solid rgba(255,255,255,0.32)',
            background: 'rgba(8,9,22,0.55)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            color: '#FFFFFF',
            fontSize: 26,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          <span>{t.backBtn}</span>
        </button>
      </div>

      {/* Countdown Ring Overlay */}
      {phase === 'count' && (
        <div
          key={count}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 380,
            height: 380,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 30,
          }}
        >
          <svg width="380" height="380" viewBox="0 0 380 380" style={{ position: 'absolute', inset: 0 }}>
            <circle cx="190" cy="190" r="180" fill="rgba(0,0,40,0.45)" stroke="rgba(255,255,255,0.22)" strokeWidth="6" />
            <circle
              cx="190"
              cy="190"
              r="180"
              fill="none"
              stroke="#00FF99"
              strokeWidth="10"
              strokeDasharray="1131"
              strokeLinecap="round"
              transform="rotate(-90 190 190)"
              className="dg-ringc"
            />
          </svg>
          <span
            className="dg-pop"
            style={{
              fontFamily: isAr ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
              fontSize: 180,
              fontWeight: 800,
              color: '#FFFFFF',
              textShadow: '0 0 40px rgba(0,255,153,0.6)',
            }}
          >
            {toLocaleDigits(count, language)}
          </span>
        </div>
      )}

      {/* Shutter Flash */}
      {phase === 'flash' && (
        <div
          className="dg-flash"
          style={{
            position: 'absolute',
            inset: 0,
            background: '#FFFFFF',
            zIndex: 40,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Operator-Togglable Upload Test Photo Button */}
      {operatorSettings.enableTestImageUpload && phase === 'idle' && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === 'string') {
                  handleUploadedFileDataUrl(reader.result);
                }
              };
              reader.readAsDataURL(file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={triggerTestUpload}
            style={{
              position: 'absolute',
              right: 56,
              bottom: 120,
              zIndex: 30,
              padding: '18px 28px',
              borderRadius: 999,
              border: '1.5px solid #00FF99',
              background: 'rgba(0, 20, 60, 0.85)',
              color: '#00FF99',
              fontSize: 22,
              fontWeight: 700,
              backdropFilter: 'blur(12px)',
            }}
          >
            {t.uploadTestPhoto}
          </button>
        </>
      )}

      {/* Shutter Button */}
      <button
        type="button"
        onClick={startCountdown}
        disabled={phase !== 'idle' || !!cameraError}
        aria-label={t.takePhotoLabel}
        className={`dg-shutter-btn${phase === 'idle' && !cameraError ? ' dg-cam-pulse' : ''}`}
        style={{
          position: 'absolute',
          left: '50%',
          top: 1650,
          width: 204,
          height: 204,
          marginLeft: -102,
          padding: 0,
          borderRadius: '50%',
          border: '6px solid rgba(255,255,255,0.92)',
          background: 'rgba(8, 16, 48, 0.35)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: cameraError ? 0.45 : 1,
          boxShadow: '0 16px 50px rgba(0, 0, 30, 0.55)',
          zIndex: 25,
        }}
      >
        <span
          className="dg-shutter-core"
          style={{
            width: 144,
            height: 144,
            borderRadius: '50%',
            background:
              phase === 'idle'
                ? 'linear-gradient(135deg, #00FF99 0%, #3399FF 100%)'
                : 'rgba(255,255,255,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: phase === 'idle' ? '0 0 28px rgba(0,255,153,0.45)' : 'none',
          }}
        >
          <svg
            aria-hidden="true"
            width="54"
            height="54"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#000066"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </span>
      </button>
    </div>
  );
};
