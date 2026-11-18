import React, { useEffect, useRef, useState } from 'react';
import { Language, LearningPathConfig, PathId } from '../types/photobooth';
import { LEARNING_PATHS } from '../data/pathsConfig';
import { getStrings, toLocaleDigits } from '../data/i18n';
import { getAssetUrl } from '../utils/assetHelper';
import { PartnerFooter } from '../components/PartnerFooter';
import { playSwipe, playTap } from '../services/soundService';

interface PathSelectionScreenProps {
  language: Language;
  selectedPathId: PathId;
  timeoutSeconds: number;
  onSelectPath: (path: LearningPathConfig) => void;
  onContinue: (path: LearningPathConfig) => void;
  onBack: () => void;
}

const PARTICLES = [
  { left: 1033, top: 1611, size: 4, color: '#FFFFFF', dur: 12.1, delay: -12.1 },
  { left: 636, top: 1715, size: 4, color: '#00FF99', dur: 14.1, delay: -6.9 },
  { left: 738, top: 1773, size: 6, color: '#FFFFFF', dur: 14.7, delay: -10.5 },
  { left: 709, top: 1849, size: 3, color: '#FFFFFF', dur: 17.3, delay: -0.5 },
  { left: 592, top: 1810, size: 3, color: '#00FF99', dur: 15.4, delay: -2.9 },
  { left: 452, top: 1824, size: 4, color: '#3399FF', dur: 16.7, delay: -10.3 },
  { left: 603, top: 1563, size: 6, color: '#FFFFFF', dur: 10.5, delay: -15.4 },
  { left: 1010, top: 1545, size: 6, color: '#00FF99', dur: 12.8, delay: -1.2 },
  { left: 328, top: 1510, size: 4, color: '#3399FF', dur: 12.4, delay: -13.8 },
  { left: 263, top: 1522, size: 4, color: '#FFFFFF', dur: 14.8, delay: -13.7 },
  { left: 793, top: 1867, size: 6, color: '#FFFFFF', dur: 14.7, delay: -9.9 },
  { left: 34, top: 1539, size: 3, color: '#3399FF', dur: 10.9, delay: -9.6 },
  { left: 424, top: 1708, size: 3, color: '#00FF99', dur: 12.3, delay: -4.7 },
  { left: 230, top: 1817, size: 6, color: '#00FF99', dur: 17.8, delay: -14.6 },
];

export const PathSelectionScreen: React.FC<PathSelectionScreenProps> = ({
  language,
  selectedPathId,
  timeoutSeconds,
  onSelectPath,
  onContinue,
  onBack,
}) => {
  const isAr = language === 'ar';
  const t = getStrings(language);
  const N = LEARNING_PATHS.length;

  const initialIdx = Math.max(
    0,
    LEARNING_PATHS.findIndex((p) => p.id === selectedPathId)
  );
  const [activeIdx, setActiveIdx] = useState(initialIdx);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [dragDx, setDragDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const startXRef = useRef<number | null>(null);
  const didDragRef = useRef(false);
  const lastSwipeAtRef = useRef(0);
  const idleTimerRef = useRef<number | null>(null);

  const resetIdleTimer = () => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    if (timeoutSeconds > 0) {
      idleTimerRef.current = window.setTimeout(() => {
        onBack();
      }, timeoutSeconds * 1000);
    }
  };

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    };
  }, [timeoutSeconds]);

  const go = (nextIdx: number) => {
    playSwipe();
    const wrapped = ((nextIdx % N) + N) % N;
    setActiveIdx(wrapped);
    setTouched(true);
    setDragDx(0);
    setDragging(false);
    onSelectPath(LEARNING_PATHS[wrapped]);
    resetIdleTimer();
  };

  const activePath = LEARNING_PATHS[activeIdx];

  const handleConfirm = (path: LearningPathConfig) => {
    if (confirming) return;
    playTap();
    setConfirming(true);
    window.setTimeout(() => {
      onContinue(path);
    }, 240);
  };

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
          opacity: 0.45,
          pointerEvents: 'none',
        }}
      />
      <span
        aria-hidden="true"
        className="pf-d1"
        style={{
          position: 'absolute',
          left: -160,
          top: 300,
          width: 620,
          height: 620,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(51,153,255,0.35), rgba(51,153,255,0) 65%)',
          pointerEvents: 'none',
        }}
      />
      <span
        aria-hidden="true"
        className="pf-d2"
        style={{
          position: 'absolute',
          right: -180,
          top: 1100,
          width: 640,
          height: 640,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,153,0.22), rgba(0,255,153,0) 65%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,50,0.65) 0%, rgba(0,0,50,0.15) 35%, rgba(0,0,50,0.2) 70%, rgba(0,0,40,0.85) 100%)',
        }}
      />

      {/* Top Bar */}
      <div
        style={{
          position: 'absolute',
          left: 72,
          right: 72,
          top: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          direction: 'ltr',
          zIndex: 20,
        }}
      >
        <button
          type="button"
          className="dg-btn-glass"
          onClick={onBack}
          aria-label={t.backBtn}
          style={{
            height: 88,
            padding: '0 32px',
            borderRadius: 999,
            border: '1.5px solid rgba(255,255,255,0.28)',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(16px)',
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

        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 26,
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={getAssetUrl('assets/logo-digilians.png')}
            alt="Digilians"
            style={{ height: 70, objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* Screen Title */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 186,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: isAr ? 28 : 22,
            fontWeight: 600,
            letterSpacing: isAr ? 0 : '0.26em',
            color: '#00FF99',
            fontFamily: isAr ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
          }}
        >
          {t.choosePathEyebrow}
        </span>
        <h1
          style={{
            margin: 0,
            fontSize: 88,
            fontWeight: 700,
            letterSpacing: isAr ? 0 : '-0.03em',
            lineHeight: 1.15,
          }}
        >
          {t.choosePathTitle}
        </h1>
      </div>

      {/* Rising Particles */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {PARTICLES.map((p, idx) => (
          <span
            key={idx}
            className="pf-rise"
            style={{
              position: 'absolute',
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: p.color,
              boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* 3D Perspective Carousel */}
      <div
        onPointerDown={(e) => {
          startXRef.current = e.clientX;
          didDragRef.current = false;
        }}
        onPointerMove={(e) => {
          if (startXRef.current == null) return;
          const dx = e.clientX - startXRef.current;
          if (Math.abs(dx) > 8) {
            didDragRef.current = true;
            if (!dragging) setDragging(true);
            setDragDx(dx);
          }
        }}
        onPointerUp={() => {
          if (startXRef.current == null) return;
          startXRef.current = null;
          if (didDragRef.current) {
            lastSwipeAtRef.current = Date.now();
          }
          if (dragDx < -90) go(activeIdx + 1);
          else if (dragDx > 90) go(activeIdx - 1);
          else {
            setDragging(false);
            setDragDx(0);
          }
        }}
        onPointerLeave={() => {
          if (startXRef.current == null) return;
          startXRef.current = null;
          if (didDragRef.current) {
            lastSwipeAtRef.current = Date.now();
          }
          setDragging(false);
          setDragDx(0);
        }}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 410,
          height: 1060,
          perspective: 1800,
          touchAction: 'pan-y',
          userSelect: 'none',
        }}
      >
        {LEARNING_PATHS.map((path, i) => {
          let rel = (((i - activeIdx) % N) + N) % N;
          if (rel > N / 2) rel -= N;
          const off = rel + dragDx / 560;
          const a = Math.abs(off);
          const sgn = off > 0 ? 1 : -1;
          const x = sgn * Math.min(a, 1) * 520 + sgn * Math.max(0, a - 1) * 300;
          const rot = -sgn * Math.min(a, 1.6) * 34;
          const sc = 1 - Math.min(a, 2) * 0.13;
          const on = i === activeIdx;
          const isHovered = hoveredIdx === i && !dragging;
          const isSelectedCard = on && confirming;
          const hoverScale = isSelectedCard ? 1.045 : isHovered ? (on ? 1.024 : 1.04) : 1;
          const hoverY = isSelectedCard ? -14 : isHovered ? -10 : 0;
          const baseOpacity = a > 1.6 ? 0 : on ? 1 : Math.max(0.25, 1 - a * 0.42);
          const cardOpacity = isHovered && !on && a <= 1.6 ? Math.min(0.92, baseOpacity + 0.22) : baseOpacity;
          const CW = 700;

          return (
            <button
              key={path.id}
              type="button"
              onPointerEnter={() => setHoveredIdx(i)}
              onPointerLeave={() => setHoveredIdx((prev) => (prev === i ? null : prev))}
              onClick={() => {
                if (didDragRef.current || Date.now() - lastSwipeAtRef.current < 320) {
                  didDragRef.current = false;
                  return;
                }
                if (on) handleConfirm(path);
                else go(i);
              }}
              aria-label={isAr ? path.nameAr : path.nameEn}
              aria-current={on ? 'true' : 'false'}
              style={{
                position: 'absolute',
                left: '50%',
                top: 0,
                width: CW,
                height: 1040,
                marginLeft: -(CW / 2),
                padding: 0,
                border: 'none',
                borderRadius: 48,
                overflow: 'hidden',
                background: '#00024A',
                color: '#FFFFFF',
                textAlign: isAr ? 'right' : 'left',
                backfaceVisibility: 'hidden',
                willChange: 'transform, opacity',
                transform: `translate3d(${x}px, ${hoverY}px, 0) rotateY(${rot}deg) scale(${sc * hoverScale})`,
                opacity: cardOpacity,
                zIndex: 10 - Math.round(a * 2),
                transition: dragging
                  ? 'none'
                  : 'transform .45s cubic-bezier(.2,.8,.2,1), opacity .4s, box-shadow .35s',
                boxShadow: isSelectedCard
                  ? 'inset 0 0 0 3px #00FF99, 0 0 120px rgba(0,255,153,0.55), 0 55px 110px rgba(0,0,20,0.75)'
                  : on
                  ? isHovered
                    ? 'inset 0 0 0 2.5px #00FF99cc, 0 0 105px rgba(0,255,153,0.38), 0 55px 100px rgba(0,0,20,0.75)'
                    : 'inset 0 0 0 2px #3399FFcc, 0 0 80px rgba(51,153,255,0.3), 0 50px 90px rgba(0,0,20,0.7)'
                  : isHovered
                  ? 'inset 0 0 0 1.5px rgba(143,200,255,0.55), 0 36px 70px rgba(0,0,20,0.65)'
                  : 'inset 0 0 0 1px rgba(143,200,255,0.25), 0 30px 60px rgba(0,0,20,0.6)',
              }}
            >
              <span
                aria-hidden="true"
                className="pf-ring"
                style={{
                  position: 'absolute',
                  left: '-50%',
                  top: '-50%',
                  width: '200%',
                  height: '200%',
                  background:
                    'conic-gradient(from 0deg, rgba(51,153,255,0) 0deg, rgba(51,153,255,0) 230deg, #3399FF 300deg, #00FF99 335deg, #FFFFFF 352deg, rgba(51,153,255,0) 360deg)',
                  opacity: on ? 1 : 0,
                  transition: 'opacity .5s',
                }}
              />
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 4,
                  borderRadius: 44,
                  overflow: 'hidden',
                  background: 'radial-gradient(120% 70% at 50% 30%, #0E1A6E 0%, #00024A 60%, #000038 100%)',
                }}
              >
                <img
                  src={getAssetUrl(path.cardImage)}
                  alt=""
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: CW,
                    height: CW,
                    objectFit: 'cover',
                    pointerEvents: 'none',
                    WebkitMaskImage: 'linear-gradient(180deg, #000 70%, transparent 98%)',
                    maskImage: 'linear-gradient(180deg, #000 70%, transparent 98%)',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background:
                      'linear-gradient(180deg, rgba(0,2,74,0) 50%, rgba(0,2,60,0.92) 66%, #00023A 100%)',
                  }}
                />
              </span>
              <span
                aria-hidden="true"
                className="pf-shine"
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: '30%',
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.12), rgba(255,255,255,0))',
                  pointerEvents: 'none',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 34,
                  display: 'flex',
                  justifyContent: isAr ? 'flex-start' : 'flex-end',
                  padding: '0 40px',
                  boxSizing: 'border-box',
                  direction: 'ltr',
                  pointerEvents: 'none',
                }}
              >
                <span
                  style={{
                    fontSize: 64,
                    fontWeight: 200,
                    lineHeight: 1,
                    letterSpacing: isAr ? 0 : '-0.03em',
                    color: '#00FF99',
                    fontFamily: isAr ? "'IBM Plex Sans Arabic', sans-serif" : "'Inter', sans-serif",
                  }}
                >
                  {toLocaleDigits(i + 1, language, 2)}
                </span>
              </span>
              <span
                style={{
                  position: 'absolute',
                  left: 44,
                  right: 44,
                  top: 660,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  textAlign: isAr ? 'right' : 'left',
                  direction: isAr ? 'rtl' : 'ltr',
                }}
              >
                <span
                  style={{
                    fontSize: isAr ? 46 : 48,
                    fontWeight: 700,
                    letterSpacing: isAr ? 0 : '-0.02em',
                    lineHeight: 1.18,
                    color: '#FFFFFF',
                  }}
                >
                  {isAr ? path.nameAr : path.nameEn}
                </span>
                <span style={{ fontSize: 27, fontWeight: 300, color: 'rgba(255,255,255,0.88)' }}>
                  {isAr ? path.taglineAr : path.taglineEn}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Carousel Arrows */}
      <button
        type="button"
        className="pf-nav-arrow"
        onClick={() => go(activeIdx - 1)}
        aria-label={t.prevPathLabel}
        style={{
          position: 'absolute',
          left: 36,
          top: 870,
          zIndex: 30,
          width: 104,
          height: 104,
          padding: 0,
          borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.35)',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 16px 40px rgba(0,0,30,0.45)',
        }}
      >
        <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>

      <button
        type="button"
        className="pf-nav-arrow"
        onClick={() => go(activeIdx + 1)}
        aria-label={t.nextPathLabel}
        style={{
          position: 'absolute',
          right: 36,
          top: 870,
          zIndex: 30,
          width: 104,
          height: 104,
          padding: 0,
          borderRadius: '50%',
          border: '1.5px solid rgba(255,255,255,0.35)',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 16px 40px rgba(0,0,30,0.45)',
        }}
      >
        <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots + Swipe Hint */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1496,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 10, direction: 'ltr' }}>
          {LEARNING_PATHS.map((d, i) => {
            const on = i === activeIdx;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => go(i)}
                aria-label={isAr ? d.nameAr : d.nameEn}
                style={{
                  height: 10,
                  width: on ? 44 : 10,
                  padding: 0,
                  border: 'none',
                  borderRadius: 5,
                  background: on ? '#00FF99' : 'rgba(255,255,255,0.35)',
                  transition: 'all .4s',
                }}
              />
            );
          })}
        </div>
        {!touched && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 20,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.7)',
            }}
          >
            <svg className="dg-swipe" aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11" />
              <path d="M12 10.5a1.5 1.5 0 0 1 3 0V12" />
              <path d="M15 11.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-.6a6 6 0 0 1-4.9-2.5L4 15a1.5 1.5 0 0 1 2.4-1.8L9 15" />
            </svg>
            <span>{t.swipeHint}</span>
          </span>
        )}
      </div>

      <PartnerFooter compact />
    </div>
  );
};
