import React, { useState } from 'react';
import { DashboardCloudConfig, Language } from '../types/photobooth';
import { getStrings } from '../data/i18n';
import { getAssetUrl } from '../utils/assetHelper';
import { PartnerFooter } from '../components/PartnerFooter';
import { playTap } from '../services/soundService';

interface SplashScreenProps {
  cloudConfig: DashboardCloudConfig;
  onSelectLanguage: (lang: Language) => void;
  onHotZoneTap: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  cloudConfig,
  onSelectLanguage,
  onHotZoneTap,
}) => {
  const isClosed = !cloudConfig.isActive;
  const isLimitReached =
    cloudConfig.dailyLimit > 0 && cloudConfig.currentGenerations >= cloudConfig.dailyLimit;
  const blocked = isClosed || isLimitReached;

  const [selectedLang, setSelectedLang] = useState<Language | null>(null);
  const enStrings = getStrings('en');
  const arStrings = getStrings('ar');

  const handlePick = (lang: Language) => {
    if (selectedLang) return;
    playTap();
    setSelectedLang(lang);
    window.setTimeout(() => {
      onSelectLanguage(lang);
    }, 260);
  };

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        position: 'relative',
        overflow: 'hidden',
        background: '#000066',
        color: '#FFFFFF',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Hidden 5-tap top-left operator hot-zone */}
      <button
        type="button"
        aria-label="Operator settings trigger"
        onClick={onHotZoneTap}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 110,
          height: 110,
          background: 'transparent',
          border: 'none',
          zIndex: 50,
          cursor: 'default',
        }}
      />

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
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(70% 34% at 50% 26%, rgba(0,0,60,0.55), rgba(0,0,60,0) 100%)',
        }}
      />

      {/* Top Digilians Logo Badge */}
      <div
        style={{
          position: 'absolute',
          left: 400,
          top: 64,
          width: 280,
          height: 280,
          borderRadius: 64,
          border: '2px solid transparent',
          background:
            'linear-gradient(160deg, rgba(255,255,255,0.97), rgba(232,242,255,0.93)) padding-box, linear-gradient(150deg, #00FF99, #3399FF 60%, rgba(51,153,255,0.3)) border-box',
          boxShadow: '0 0 60px rgba(51,153,255,0.45), 0 30px 70px rgba(0,0,30,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={getAssetUrl('assets/logo-digilians.png')}
          alt="Digilians"
          style={{ height: 216, objectFit: 'contain' }}
        />
      </div>
      <span
        aria-hidden="true"
        className="dg-pulse"
        style={{
          position: 'absolute',
          left: 370,
          top: 34,
          width: 340,
          height: 340,
          borderRadius: 80,
          border: '1.5px solid rgba(143,200,255,0.35)',
          pointerEvents: 'none',
        }}
      />

      {/* Welcome Header */}
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          top: 410,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '0.32em',
            color: '#8FC8FF',
          }}
        >
          <span
            className="dg-pulse"
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#00FF99',
              boxShadow: '0 0 14px #00FF99',
            }}
          />
          AI PHOTO BOOTH
          <span
            className="dg-pulse"
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#3399FF',
              boxShadow: '0 0 14px #3399FF',
              animationDelay: '1.2s',
            }}
          />
        </span>
        <h1
          dir="rtl"
          style={{
            margin: '8px 0 0',
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontSize: 108,
            fontWeight: 700,
            lineHeight: 1.2,
            background: 'linear-gradient(180deg, #FFFFFF 45%, #8FC8FF 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            filter: 'drop-shadow(0 0 26px rgba(51,153,255,0.5))',
          }}
        >
          أهلاً بك
        </h1>
        <p
          style={{
            margin: '-6px 0 0',
            fontSize: 54,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
          }}
        >
          Welcome
        </p>
        <span
          style={{
            margin: '18px 0 6px',
            width: 240,
            height: 4,
            borderRadius: 2,
            background:
              'linear-gradient(90deg, rgba(0,255,153,0), #00FF99, #3399FF, rgba(51,153,255,0))',
            boxShadow: '0 0 14px rgba(0,255,153,0.6)',
          }}
        />
        <p
          dir="rtl"
          style={{
            margin: 0,
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontSize: 38,
            fontWeight: 600,
          }}
        >
          اختر لغة التجربة{' '}
          <span style={{ color: '#8FC8FF', fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
            · Choose your language
          </span>
        </p>
      </div>

      {/* Event Gate Banner if closed or at limit */}
      {blocked ? (
        <div
          style={{
            position: 'absolute',
            left: 88,
            right: 88,
            top: 950,
            padding: '56px 48px',
            borderRadius: 40,
            background: 'rgba(10, 14, 52, 0.88)',
            border: '2px solid rgba(255, 107, 107, 0.55)',
            backdropFilter: 'blur(24px)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            boxShadow: '0 30px 80px rgba(0,0,20,0.65)',
          }}
        >
          <span
            dir="rtl"
            style={{
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
              fontSize: 44,
              fontWeight: 700,
              color: '#FFD1D1',
            }}
          >
            {isClosed ? arStrings.eventClosedTitle : arStrings.eventLimitTitle}
          </span>
          <span style={{ fontSize: 34, fontWeight: 600, color: '#FFFFFF' }}>
            {isClosed ? enStrings.eventClosedTitle : enStrings.eventLimitTitle}
          </span>
        </div>
      ) : (
        /* Language Cards */
        <div
          style={{
            position: 'absolute',
            left: 72,
            right: 72,
            top: 860,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 40,
            direction: 'rtl',
          }}
        >
          {/* Arabic Card */}
          <div className="dg-float" style={{ animationDelay: '0s', perspective: 1400 }}>
            <button
              type="button"
              lang="ar"
              onClick={() => handlePick('ar')}
              className={`dg-lang-card dg-lang-card-ar${
                selectedLang === 'ar'
                  ? ' is-selected'
                  : selectedLang === 'en'
                  ? ' is-dimmed'
                  : ''
              }`}
              style={{
                width: '100%',
                display: 'block',
                position: 'relative',
                height: 600,
                borderRadius: 48,
                padding: 3,
                border: 'none',
                overflow: 'hidden',
                background: 'transparent',
                textAlign: 'right',
              }}
            >
              <span
                aria-hidden="true"
                className="dg-ring-g"
                style={{ position: 'absolute', left: '-50%', top: '-50%', width: '200%', height: '200%' }}
              />
              <span
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  borderRadius: 45,
                  padding: 44,
                  overflow: 'hidden',
                  background: 'linear-gradient(165deg, rgba(24,64,230,0.62), rgba(0,0,80,0.82))',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
                  direction: 'rtl',
                }}
              >
                <span
                  aria-hidden="true"
                  className="dg-shine"
                  style={{
                    position: 'absolute',
                    top: '-20%',
                    bottom: '-20%',
                    width: '40%',
                    background:
                      'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,0.16), rgba(255,255,255,0))',
                  }}
                />
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: -140,
                    top: -140,
                    width: 380,
                    height: 380,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #00FF9966, #00FF9900 65%)',
                  }}
                />
                <span style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      padding: '8px 18px',
                      borderRadius: 999,
                      border: '1.5px solid #00FF99',
                      color: '#00FF99',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 22,
                      fontWeight: 800,
                      letterSpacing: '0.14em',
                    }}
                  >
                    AR
                  </span>
                  <span style={{ display: 'flex', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FF99', boxShadow: '0 0 10px #00FF99' }} />
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.35)' }} />
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                  </span>
                </span>
                <span style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                      fontSize: 150,
                      fontWeight: 700,
                      lineHeight: 1.25,
                      background: 'linear-gradient(160deg, #FFFFFF 25%, #8FE3FF 65%, #00FF99 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      filter: 'drop-shadow(0 0 30px rgba(0,255,153,0.35))',
                    }}
                  >
                    مرحباً
                  </span>
                  <span
                    style={{
                      width: 90,
                      height: 4,
                      borderRadius: 2,
                      background: 'linear-gradient(90deg, rgba(255,255,255,0), #00FF99, rgba(255,255,255,0))',
                      boxShadow: '0 0 12px #00FF99',
                    }}
                  />
                </span>
                <span style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", fontSize: 60, fontWeight: 700, lineHeight: 1.2, color: '#FFFFFF' }}>
                      العربية
                    </span>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 600, color: '#8FC8FF', direction: 'ltr', textAlign: 'right' }}>
                      Arabic
                    </span>
                  </span>
                  <span
                    className="dg-lang-arrow"
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00FF99, #3399FF)',
                      color: '#000066',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 30px #00FF9999',
                    }}
                  >
                    <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </span>
              </span>
            </button>
            <span
              aria-hidden="true"
              style={{
                display: 'block',
                margin: '26px auto 0',
                width: '70%',
                height: 40,
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, #00FF9955, #00FF9900 70%)',
              }}
            />
          </div>

          {/* English Card */}
          <div className="dg-float" style={{ animationDelay: '1.6s', perspective: 1400 }}>
            <button
              type="button"
              lang="en"
              onClick={() => handlePick('en')}
              className={`dg-lang-card dg-lang-card-en${
                selectedLang === 'en'
                  ? ' is-selected'
                  : selectedLang === 'ar'
                  ? ' is-dimmed'
                  : ''
              }`}
              style={{
                width: '100%',
                display: 'block',
                position: 'relative',
                height: 600,
                borderRadius: 48,
                padding: 3,
                border: 'none',
                overflow: 'hidden',
                background: 'transparent',
                textAlign: 'left',
              }}
            >
              <span
                aria-hidden="true"
                className="dg-ring-b"
                style={{ position: 'absolute', left: '-50%', top: '-50%', width: '200%', height: '200%' }}
              />
              <span
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  borderRadius: 45,
                  padding: 44,
                  overflow: 'hidden',
                  background: 'linear-gradient(165deg, rgba(24,64,230,0.62), rgba(0,0,80,0.82))',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
                  direction: 'ltr',
                }}
              >
                <span
                  aria-hidden="true"
                  className="dg-shine"
                  style={{
                    position: 'absolute',
                    top: '-20%',
                    bottom: '-20%',
                    width: '40%',
                    background:
                      'linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,0.16), rgba(255,255,255,0))',
                    animationDelay: '3.2s',
                  }}
                />
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    right: -140,
                    top: -140,
                    width: 380,
                    height: 380,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #3399FF66, #3399FF00 65%)',
                  }}
                />
                <span style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      padding: '8px 18px',
                      borderRadius: 999,
                      border: '1.5px solid #3399FF',
                      color: '#3399FF',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 22,
                      fontWeight: 800,
                      letterSpacing: '0.14em',
                    }}
                  >
                    EN
                  </span>
                  <span style={{ display: 'flex', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3399FF', boxShadow: '0 0 10px #3399FF' }} />
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.35)' }} />
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                  </span>
                </span>
                <span style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 150,
                      fontWeight: 800,
                      letterSpacing: '-0.05em',
                      lineHeight: 1.25,
                      background: 'linear-gradient(160deg, #FFFFFF 25%, #8FC8FF 65%, #3399FF 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                      filter: 'drop-shadow(0 0 30px rgba(51,153,255,0.45))',
                    }}
                  >
                    Hello
                  </span>
                  <span
                    style={{
                      width: 90,
                      height: 4,
                      borderRadius: 2,
                      background: 'linear-gradient(90deg, rgba(255,255,255,0), #3399FF, rgba(255,255,255,0))',
                      boxShadow: '0 0 12px #3399FF',
                    }}
                  />
                </span>
                <span style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 56, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, color: '#FFFFFF' }}>
                      English
                    </span>
                    <span style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif", fontSize: 24, fontWeight: 600, color: '#8FC8FF', direction: 'rtl', textAlign: 'left' }}>
                      الإنجليزية
                    </span>
                  </span>
                  <span
                    className="dg-lang-arrow"
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3399FF, #1A4DFF)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 30px #3399FF99',
                    }}
                  >
                    <svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </span>
              </span>
            </button>
            <span
              aria-hidden="true"
              style={{
                display: 'block',
                margin: '26px auto 0',
                width: '70%',
                height: 40,
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, #3399FF55, #3399FF00 70%)',
              }}
            />
          </div>
        </div>
      )}

      <PartnerFooter />
    </div>
  );
};
