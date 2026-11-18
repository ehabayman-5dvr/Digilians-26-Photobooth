import React, { useEffect, useRef, useState } from 'react';
import {
  Language,
  LearningPathConfig,
  LocalOperatorSettings,
} from '../types/photobooth';
import { getStrings } from '../data/i18n';
import { getAssetUrl } from '../utils/assetHelper';
import { dispatchPhysicalPrint } from '../services/printService';
import { playSuccessChime, playTap } from '../services/soundService';

interface ResultScreenProps {
  language: Language;
  selectedPath: LearningPathConfig;
  finalImageUrl: string;
  qrCodeDataUrl: string | null;
  qrLoading: boolean;
  qrError: string | null;
  operatorSettings: LocalOperatorSettings;
  onRetryUpload: () => void;
  onTryAnotherPath: () => void;
  onDone: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  language,
  selectedPath,
  finalImageUrl,
  qrCodeDataUrl,
  qrLoading,
  qrError,
  operatorSettings,
  onRetryUpload,
  onTryAnotherPath,
  onDone,
}) => {
  const isAr = language === 'ar';
  const t = getStrings(language);

  const [printing, setPrinting] = useState(false);
  const [hasPrinted, setHasPrinted] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);
  const idleTimerRef = useRef<number | null>(null);
  const autoPrintedRef = useRef(false);
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [confettiDone, setConfettiDone] = useState(false);

  const resetIdleTimer = () => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    const timeoutSec = operatorSettings.resultIdleTimeoutSeconds || 60;
    if (timeoutSec > 0) {
      idleTimerRef.current = window.setTimeout(() => {
        onDone();
      }, timeoutSec * 1000);
    }
  };

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, [operatorSettings.resultIdleTimeoutSeconds]);

  const handlePrint = async () => {
    resetIdleTimer();
    if (printing) return;
    if (operatorSettings.singlePrintPerSession && hasPrinted) return;
    playTap();

    setPrinting(true);
    setPrintError(null);
    const res = await dispatchPhysicalPrint(finalImageUrl, operatorSettings);
    setPrinting(false);

    if (res.success) {
      setHasPrinted(true);
    } else {
      setPrintError(res.error || 'Print failed');
    }
  };

  useEffect(() => {
    playSuccessChime();

    const canvas = confettiCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const colors = ['#00FF99', '#3399FF', '#FFFFFF', '#8FC8FF'];
        const particles = Array.from({ length: 70 }, () => {
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
          const speed = 10 + Math.random() * 18;
          return {
            x: 540 + (Math.random() - 0.5) * 260,
            y: 360 + (Math.random() - 0.5) * 100,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 4,
            w: 8 + Math.random() * 10,
            h: 6 + Math.random() * 8,
            rot: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.25,
            color: colors[Math.floor(Math.random() * colors.length)],
          };
        });

        const startAt = performance.now();
        const duration = 1800;
        let rafId = 0;

        const frame = (now: number) => {
          const elapsed = now - startAt;
          if (elapsed >= duration) {
            ctx.clearRect(0, 0, 1080, 1920);
            setConfettiDone(true);
            return;
          }
          const alpha = elapsed > duration * 0.65 ? Math.max(0, 1 - (elapsed - duration * 0.65) / (duration * 0.35)) : 1;
          ctx.clearRect(0, 0, 1080, 1920);
          ctx.globalAlpha = alpha;
          for (const p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.48;
            p.vx *= 0.99;
            p.rot += p.vr;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
          }
          rafId = window.requestAnimationFrame(frame);
        };
        rafId = window.requestAnimationFrame(frame);
        return () => window.cancelAnimationFrame(rafId);
      }
    }
  }, []);

  useEffect(() => {
    if (
      operatorSettings.enablePrinting &&
      operatorSettings.autoPrintOnResult &&
      !autoPrintedRef.current
    ) {
      autoPrintedRef.current = true;
      void handlePrint();
    }
  }, []);

  const printDisabled =
    printing || (operatorSettings.singlePrintPerSession && hasPrinted);

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      onPointerDown={() => resetIdleTimer()}
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
      <video
        aria-hidden="true"
        src={getAssetUrl('assets/bg-main.mp4')}
        poster={getAssetUrl('assets/bg-main.png')}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          objectFit: 'cover',
          opacity: 0.6,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,40,0.6) 0%, rgba(0,0,40,0.4) 40%, rgba(0,0,40,0.65) 100%)',
        }}
      />

      {/* Title */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 120, textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 56, fontWeight: 700, letterSpacing: isAr ? 0 : '-0.01em' }}>
          {t.resultTitle}
        </h1>
      </div>

      {/* Framed Portrait Preview with Automatic 3D Parallax & Twinkling Stars */}
      <div
        className="dg-result-card"
        style={{
          position: 'absolute',
          left: 180,
          top: 220,
          width: 720,
          height: 1080,
          borderRadius: 28,
          overflow: 'hidden',
          background: '#000066',
          boxShadow: '0 0 85px rgba(51,153,255,0.42), 0 42px 95px rgba(0,0,20,0.65)',
        }}
      >
        <img
          src={finalImageUrl}
          alt="Generated portrait"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {/* Subtle Automatic Specular Sheen */}
        <div
          aria-hidden="true"
          className="dg-result-sheen"
          style={{
            position: 'absolute',
            top: '-10%',
            bottom: '-10%',
            left: 0,
            width: '45%',
            pointerEvents: 'none',
            background:
              'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.16), rgba(255,255,255,0))',
          }}
        />
        {/* Twinkling Corner Sparkles */}
        <svg aria-hidden="true" className="fx-tw" viewBox="0 0 24 24" width="24" height="24" style={{ position: 'absolute', left: 640, top: 40, animationDelay: '0s', filter: 'drop-shadow(0 0 8px #FFFFFF)', pointerEvents: 'none' }}>
          <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="#FFFFFF" />
        </svg>
        <svg aria-hidden="true" className="fx-tw" viewBox="0 0 24 24" width="16" height="16" style={{ position: 'absolute', left: 672, top: 110, animationDelay: '0.8s', filter: 'drop-shadow(0 0 8px #00FF99)', pointerEvents: 'none' }}>
          <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="#00FF99" />
        </svg>
        <svg aria-hidden="true" className="fx-tw" viewBox="0 0 24 24" width="20" height="20" style={{ position: 'absolute', left: 20, top: 820, animationDelay: '1.4s', filter: 'drop-shadow(0 0 8px #3399FF)', pointerEvents: 'none' }}>
          <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="#3399FF" />
        </svg>
        <svg aria-hidden="true" className="fx-tw" viewBox="0 0 24 24" width="16" height="16" style={{ position: 'absolute', left: 674, top: 860, animationDelay: '1.9s', filter: 'drop-shadow(0 0 8px #00FF99)', pointerEvents: 'none' }}>
          <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="#00FF99" />
        </svg>
      </div>

      {/* QR Code + Print Row */}
      <div
        style={{
          position: 'absolute',
          left: 72,
          right: 72,
          top: 1350,
          height: 270,
          display: 'flex',
          gap: 28,
          direction: isAr ? 'rtl' : 'ltr',
        }}
      >
        <div
          className="dg-qr-card"
          style={{
            flex: 1.15,
            borderRadius: 36,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            display: 'flex',
            alignItems: 'center',
            gap: 26,
            padding: '0 30px',
          }}
        >
          <div
            className="dg-qr-box"
            style={{
              width: 214,
              height: 214,
              borderRadius: 22,
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
              padding: 10,
              position: 'relative',
            }}
          >
            {qrLoading ? (
              <span style={{ fontSize: 18, fontWeight: 600, color: '#000066', textAlign: 'center' }}>
                {t.qrLoading}
              </span>
            ) : qrCodeDataUrl ? (
              <>
                <img src={qrCodeDataUrl} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                <span
                  aria-hidden="true"
                  className="dg-qr-scan"
                  style={{
                    position: 'absolute',
                    left: 10,
                    right: 10,
                    height: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(90deg, transparent, #00FF99, #3399FF, transparent)',
                    pointerEvents: 'none',
                  }}
                />
              </>
            ) : (
              <button
                type="button"
                onClick={onRetryUpload}
                style={{
                  border: 'none',
                  background: '#000066',
                  color: '#FFFFFF',
                  padding: '12px 16px',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {t.qrRetry}
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: isAr ? 0 : '-0.01em' }}>
              {t.scanToDownload}
            </span>
            <span style={{ fontSize: 22, fontWeight: 300, color: 'rgba(255,255,255,0.75)' }}>
              {qrError ? t.qrUnavailable : t.scanSub}
            </span>
          </div>
        </div>

        {operatorSettings.enablePrinting && (
          <button
            type="button"
            className="dg-btn-primary"
            onClick={handlePrint}
            disabled={printDisabled}
            style={{
              flex: 0.85,
              border: 'none',
              borderRadius: 36,
              background: '#FFFFFF',
              color: '#0B0C17',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              opacity: printDisabled ? 0.65 : 1,
              boxShadow: '0 20px 50px rgba(0,0,30,0.4)',
            }}
          >
            <span
              className="dg-btn-arrow"
              style={{
                width: 92,
                height: 92,
                borderRadius: '50%',
                background: selectedPath.accent,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                aria-hidden="true"
                width="44"
                height="44"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9V3h12v6" />
                <rect x="3" y="9" width="18" height="8" rx="2" />
                <path d="M6 14h12v7H6z" />
              </svg>
            </span>
            <span style={{ fontSize: 32, fontWeight: 700 }}>
              {printing ? t.printingBtn : hasPrinted ? t.printedBtn : t.printBtn}
            </span>
            {printError && (
              <span style={{ fontSize: 15, color: '#DC2626', fontWeight: 600 }}>
                {printError}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Bottom Action Row */}
      <div
        style={{
          position: 'absolute',
          left: 72,
          right: 72,
          top: 1668,
          height: 120,
          display: 'flex',
          gap: 24,
          direction: isAr ? 'rtl' : 'ltr',
        }}
      >
        <button
          type="button"
          className="dg-btn-glass"
          onClick={() => {
            playTap();
            onTryAnotherPath();
          }}
          style={{
            flex: 1,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.08)',
            border: '1.5px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
          }}
        >
          <span style={{ fontSize: 32, fontWeight: 600 }}>{t.tryAnotherPath}</span>
        </button>
      </div>

      {!confettiDone && (
        <canvas
          ref={confettiCanvasRef}
          width={1080}
          height={1920}
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 60,
          }}
        />
      )}
    </div>
  );
};
