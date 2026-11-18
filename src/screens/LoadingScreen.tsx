import React, { useEffect, useState } from 'react';
import { Language, LearningPathConfig } from '../types/photobooth';
import { getStrings } from '../data/i18n';
import { getAssetUrl } from '../utils/assetHelper';

interface LoadingScreenProps {
  language: Language;
  selectedPath: LearningPathConfig;
  errorMessage: string | null;
  onRetry: () => void;
  onRetake: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  language,
  selectedPath,
  errorMessage,
  onRetry,
  onRetake,
}) => {
  const isAr = language === 'ar';
  const t = getStrings(language);
  const [progress, setProgress] = useState(6);
  const [dots, setDots] = useState(1);

  useEffect(() => {
    if (errorMessage) return;
    const iv = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        const step = prev < 50 ? 2.4 : prev < 80 ? 1.2 : 0.4;
        return Math.min(92, prev + step);
      });
      setDots((d) => (d % 3) + 1);
    }, 350);
    return () => window.clearInterval(iv);
  }, [errorMessage]);

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

      {/* Top Mode Badge */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 168, display: 'flex', justifyContent: 'center' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 26px',
            borderRadius: 999,
            border: '1px solid #3399FF88',
            background: '#3399FF18',
            fontSize: 18,
            letterSpacing: isAr ? 0 : '0.28em',
            fontWeight: 600,
            color: '#FFFFFF',
          }}
        >
          <span
            className="g-blink"
            style={{ width: 10, height: 10, borderRadius: '50%', background: '#3399FF' }}
          />
          {isAr ? selectedPath.loadingBadgeAr : selectedPath.loadingBadgeEn}
        </span>
      </div>

      {/* Central Thematic Visual (820x820) */}
      <div style={{ position: 'absolute', left: 130, top: 236, width: 820, height: 820 }}>
        <div
          aria-hidden="true"
          className="g-breath"
          style={{
            position: 'absolute',
            inset: 40,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #3399FF30 0%, transparent 62%)',
          }}
        />

        {/* Theme: Neural / Digital Arts / Data (with supplied MP4 loop) */}
        {selectedPath.loadingVideo && (
          <>
            {selectedPath.loadingTheme === 'digital_arts' && (
              <>
                <div aria-hidden="true" className="g-spin" style={{ position: 'absolute', inset: 0, animationDuration: '14s' }}>
                  <span style={{ position: 'absolute', left: 30, top: 60, width: 300, height: 300, borderRadius: '50%', background: '#3399FF', filter: 'blur(70px)', opacity: 0.5 }} />
                </div>
                <div aria-hidden="true" className="g-spin-r" style={{ position: 'absolute', inset: 0, animationDuration: '18s' }}>
                  <span style={{ position: 'absolute', left: 480, top: 440, width: 300, height: 300, borderRadius: '50%', background: '#00FF99', filter: 'blur(70px)', opacity: 0.5 }} />
                </div>
              </>
            )}
            <svg aria-hidden="true" viewBox="0 0 820 820" style={{ position: 'absolute', inset: 0 }}>
              <circle cx="410" cy="410" r="330" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="1.5" strokeDasharray="4 10" />
              <circle cx="410" cy="410" r="370" fill="none" stroke="rgba(0,255,153,0.18)" strokeWidth="1" />
            </svg>
            <div
              style={{
                position: 'absolute',
                left: 160,
                top: 160,
                width: 500,
                height: 500,
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#080C38',
                boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.28), 0 0 80px #00FF9944',
              }}
            >
              <video
                src={getAssetUrl(selectedPath.loadingVideo)}
                autoPlay
                loop
                muted
                playsInline
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </>
        )}

        {/* Theme: Cybersecurity (Shield + Scanline) */}
        {selectedPath.loadingTheme === 'cybersecurity' && (
          <>
            <svg aria-hidden="true" viewBox="0 0 820 820" style={{ position: 'absolute', inset: 0 }}>
              <path
                d="M410 70 L690 170 L690 420 C690 590 560 700 410 760 C260 700 130 590 130 420 L130 170 Z"
                fill="none"
                stroke="#3399FF"
                strokeWidth="5"
                strokeLinejoin="round"
                className="g-draw"
                style={{ strokeDasharray: 2300, filter: 'drop-shadow(0 0 14px #3399FF)' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                left: 190,
                top: 190,
                width: 440,
                height: 440,
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.28), 0 0 80px #00FF9944',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg viewBox="0 0 440 440" style={{ width: '100%', height: '100%' }}>
                <path
                  d="M220 62 L348 108 L348 222 C348 302 290 352 220 380 C150 352 92 302 92 222 L92 108 Z"
                  fill="rgba(0,224,255,0.16)"
                  stroke="#00E0FF"
                  strokeWidth="5"
                />
                <path d="M188 212 V188 a32 32 0 0 1 64 0 V212" fill="none" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
                <rect x="168" y="206" width="104" height="80" rx="16" fill="none" stroke="#FFFFFF" strokeWidth="6" />
                <circle cx="220" cy="240" r="10" fill="#00E0FF" />
              </svg>
              <span
                aria-hidden="true"
                className="g-scan"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 3,
                  background: 'linear-gradient(90deg, transparent, #00E0FF, transparent)',
                  boxShadow: '0 0 24px #00E0FF',
                }}
              />
            </div>
          </>
        )}

        {/* Theme: Software (Floating Code Windows) */}
        {selectedPath.loadingTheme === 'software' && (
          <>
            <span aria-hidden="true" className="g-float" style={{ position: 'absolute', left: 40, top: 60, fontFamily: 'monospace', fontSize: 54, color: '#3399FF', opacity: 0.55 }}>&lt;/&gt;</span>
            <span aria-hidden="true" className="g-float" style={{ position: 'absolute', left: 700, top: 90, fontFamily: 'monospace', fontSize: 44, color: '#3399FF', opacity: 0.55, animationDelay: '1.2s' }}>{'{ }'}</span>
            <div
              className="g-float"
              style={{
                position: 'absolute',
                left: 140,
                top: 180,
                width: 540,
                height: 540,
                borderRadius: 26,
                overflow: 'hidden',
                background: 'rgba(20,14,40,0.62)',
                border: '1.5px solid #3399FF88',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 0 50px #3399FF33',
              }}
            >
              <div style={{ height: 40, display: 'flex', alignItems: 'center', gap: 8, padding: '0 18px', background: 'rgba(255,255,255,0.06)', direction: 'ltr' }}>
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#FEBC2E' }} />
                <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840' }} />
              </div>
              <div style={{ padding: '28px 30px', fontFamily: 'monospace', fontSize: 24, direction: 'ltr', textAlign: 'left', lineHeight: 1.7, color: '#E2E8F0' }}>
                <div><span style={{ color: '#FF7A45' }}>from</span> digilians <span style={{ color: '#FF7A45' }}>import</span> ai</div>
                <div style={{ color: 'rgba(255,255,255,0.45)' }}># capture the visitor</div>
                <div>photo = camera.<span style={{ color: '#7AE0FF' }}>capture</span>()</div>
                <div>portrait = ai.<span style={{ color: '#7AE0FF' }}>generate</span>(</div>
                <div>&nbsp;&nbsp;image=photo,</div>
                <div>&nbsp;&nbsp;path=<span style={{ color: '#FFB547' }}>"software"</span>,</div>
                <div>&nbsp;&nbsp;style=<span style={{ color: '#FFB547' }}>"future"</span></div>
                <div>)</div>
                <div><span style={{ color: '#7AE0FF' }}>show</span>(portrait) <span className="g-blink" style={{ display: 'inline-block', width: 12, height: 22, background: '#FFB547', verticalAlign: 'middle' }} /></div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Status & Progress */}
      {errorMessage ? (
        <div
          style={{
            position: 'absolute',
            left: 96,
            right: 96,
            top: 1120,
            padding: 48,
            borderRadius: 36,
            background: 'rgba(10, 14, 52, 0.9)',
            border: '2px solid rgba(255, 107, 107, 0.55)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <div style={{ fontSize: 40, fontWeight: 700, color: '#FFD1D1' }}>{t.genErrorTitle}</div>
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.8)', wordBreak: 'break-word' }}>
            {errorMessage}
          </div>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 12 }}>
            <button
              type="button"
              onClick={onRetake}
              style={{
                padding: '22px 44px',
                borderRadius: 999,
                border: '1.5px solid rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.1)',
                color: '#FFFFFF',
                fontSize: 28,
                fontWeight: 600,
              }}
            >
              {t.retakeBtn}
            </button>
            <button
              type="button"
              onClick={onRetry}
              style={{
                padding: '22px 48px',
                borderRadius: 999,
                border: 'none',
                background: '#FFFFFF',
                color: '#000066',
                fontSize: 28,
                fontWeight: 700,
              }}
            >
              {t.retryBtn}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ position: 'absolute', left: 80, right: 80, top: 1110, textAlign: 'center' }}>
            <span style={{ fontSize: 64, fontWeight: 700, letterSpacing: isAr ? 0 : '-0.02em' }}>
              {t.generatingLabel}
              {'.'.repeat(dots)}
            </span>
          </div>

          <div style={{ position: 'absolute', left: 200, right: 200, top: 1250 }}>
            <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.14)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  borderRadius: 5,
                  background: 'linear-gradient(90deg, #3399FF, #00FF99)',
                  boxShadow: '0 0 18px #00FF99',
                  transition: 'width .25s linear',
                }}
              />
            </div>
            <div
              style={{
                marginTop: 18,
                textAlign: 'center',
                fontSize: 26,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.85)',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {Math.round(progress)}%
            </div>
          </div>
        </>
      )}
    </div>
  );
};
