import React, { useEffect, useRef, useState } from 'react';
import { Language, LearningPathConfig } from '../types/photobooth';
import { getStrings, toLocaleDigits } from '../data/i18n';
import { getAssetUrl } from '../utils/assetHelper';
import { playTap } from '../services/soundService';

interface PreviewScreenProps {
  language: Language;
  selectedPath: LearningPathConfig;
  capturedDataUrl: string;
  autoProceedSeconds: number;
  onRetake: () => void;
  onProceed: () => void;
}

export const PreviewScreen: React.FC<PreviewScreenProps> = ({
  language,
  selectedPath,
  capturedDataUrl,
  autoProceedSeconds,
  onRetake,
  onProceed,
}) => {
  const isAr = language === 'ar';
  const t = getStrings(language);
  const totalMs = Math.max(2, autoProceedSeconds || 5) * 1000;
  const [elapsedMs, setElapsedMs] = useState(0);
  const proceededRef = useRef(false);

  useEffect(() => {
    const start = Date.now();
    const iv = window.setInterval(() => {
      const e = Date.now() - start;
      setElapsedMs(e);
      if (e >= totalMs && !proceededRef.current) {
        proceededRef.current = true;
        window.clearInterval(iv);
        onProceed();
      }
    }, 80);

    return () => window.clearInterval(iv);
  }, [totalMs, onProceed]);

  const leftSec = Math.max(0, Math.ceil((totalMs - elapsedMs) / 1000));
  const canRetake = elapsedMs < totalMs;
  const drainPct = Math.max(0, 100 - (elapsedMs / totalMs) * 100);

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

      {/* Captured Photo Card */}
      <div
        style={{
          position: 'absolute',
          left: 48,
          right: 48,
          top: 176,
          height: 1320,
          borderRadius: 64,
          overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
          boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.22), 0 40px 90px rgba(0,0,20,0.6)',
        }}
      >
        <img
          src={capturedDataUrl}
          alt="Captured preview"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: isAr ? undefined : 40,
            right: isAr ? 40 : undefined,
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 22px',
            borderRadius: 999,
            background: 'rgba(8,9,22,0.6)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            fontSize: 20,
            fontWeight: 600,
            color: '#FFFFFF',
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: selectedPath.accent,
            }}
          />
          <span>{isAr ? selectedPath.nameAr : selectedPath.nameEn}</span>
        </span>
      </div>

      {/* Review Title & Hint */}
      <p
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1510,
          margin: 0,
          textAlign: 'center',
          fontSize: 38,
          fontWeight: 600,
          letterSpacing: isAr ? 0 : '-0.01em',
        }}
      >
        {t.reviewTitle}
      </p>
      <p
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1578,
          margin: 0,
          textAlign: 'center',
          fontSize: 22,
          color: 'rgba(255,255,255,0.75)',
        }}
      >
        {canRetake ? t.reviewHintOpen(leftSec) : t.reviewHintClosed}
      </p>

      {/* Action Buttons */}
      <div
        style={{
          position: 'absolute',
          left: 48,
          right: 48,
          top: 1640,
          height: 140,
          display: 'flex',
          gap: 24,
          direction: isAr ? 'rtl' : 'ltr',
        }}
      >
        {canRetake ? (
          <button
            type="button"
            className="dg-btn-glass"
            onClick={() => {
              if (!proceededRef.current) {
                playTap();
                proceededRef.current = true;
                onRetake();
              }
            }}
            style={{
              flex: 1,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.08)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              color: '#FFFFFF',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: isAr ? undefined : 0,
                right: isAr ? 0 : undefined,
                width: `${drainPct}%`,
                background: 'rgba(255,255,255,0.16)',
                transition: 'width .08s linear',
              }}
            />
            <svg
              aria-hidden="true"
              style={{ position: 'relative' }}
              width="38"
              height="38"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
            <span style={{ position: 'relative', fontSize: 34, fontWeight: 600 }}>
              {t.retakeBtn}
            </span>
            <span
              style={{
                position: 'relative',
                minWidth: 52,
                height: 52,
                borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 600,
                fontFamily: isAr ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
              }}
            >
              {toLocaleDigits(leftSec, language)}
            </span>
          </button>
        ) : (
          <span
            aria-disabled="true"
            style={{
              flex: 1,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.04)',
              border: '1.5px dashed rgba(255,255,255,0.18)',
              color: 'rgba(255,255,255,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 500 }}>{t.retakeClosedBtn}</span>
          </span>
        )}

        <button
          type="button"
          className="dg-btn-primary"
          onClick={() => {
            if (!proceededRef.current) {
              playTap();
              proceededRef.current = true;
              onProceed();
            }
          }}
          style={{
            flex: 1.3,
            border: 'none',
            borderRadius: 999,
            background: '#FFFFFF',
            color: '#0B0C17',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
            boxShadow: '0 20px 50px rgba(0,0,30,0.45)',
          }}
        >
          <span style={{ fontSize: 38, fontWeight: 700, letterSpacing: isAr ? 0 : '-0.01em' }}>
            {t.continueBtn}
          </span>
          <span
            className="dg-btn-arrow"
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#3399FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: isAr ? 'scaleX(-1)' : undefined,
            }}
          >
            <svg
              aria-hidden="true"
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};
