import React from 'react';
import { getAssetUrl } from '../utils/assetHelper';

interface PartnerFooterProps {
  compact?: boolean;
}

export const PartnerFooter: React.FC<PartnerFooterProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div
        style={{
          position: 'absolute',
          left: 72,
          right: 72,
          bottom: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            height: 100,
            padding: '0 36px',
            borderRadius: 28,
            background: 'rgba(255,255,255,0.94)',
            display: 'flex',
            alignItems: 'center',
            gap: 36,
          }}
        >
          <img
            src={getAssetUrl('assets/logo-mcit.png')}
            alt="Ministry of Communications and Information Technology"
            style={{ height: 70, objectFit: 'contain' }}
          />
          <span style={{ width: 1, height: 60, background: 'rgba(0,0,102,0.15)' }} />
          <img
            src={getAssetUrl('assets/logo-ema.png')}
            alt="Egyptian Military Academy"
            style={{ height: 76, objectFit: 'contain' }}
          />
          <span style={{ width: 1, height: 60, background: 'rgba(0,0,102,0.15)' }} />
          <img
            src={getAssetUrl('assets/logo-5dvr.png')}
            alt="5dVR — Future Reality"
            style={{ height: 64, objectFit: 'contain' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: 72,
        right: 72,
        bottom: 56,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: '0.22em',
          color: '#BFE0FF',
        }}
      >
        <span
          style={{
            width: 60,
            height: 1.5,
            background: 'linear-gradient(90deg, rgba(143,200,255,0), rgba(143,200,255,0.9))',
          }}
        />
        <span
          dir="rtl"
          style={{
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            letterSpacing: 0,
            fontSize: 24,
          }}
        >
          بالشراكة مع
        </span>
        ·<span>IN PARTNERSHIP WITH</span>
        <span
          style={{
            width: 60,
            height: 1.5,
            background: 'linear-gradient(90deg, rgba(143,200,255,0.9), rgba(143,200,255,0))',
          }}
        />
      </span>
      <div
        style={{
          width: '100%',
          height: 200,
          borderRadius: 40,
          border: '2px solid transparent',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.97), rgba(232,242,255,0.94)) padding-box, linear-gradient(90deg, #00FF99, #3399FF 50%, #00FF99) border-box',
          boxShadow: '0 0 50px rgba(51,153,255,0.40), 0 24px 60px rgba(0,0,30,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 40px',
        }}
      >
        <img
          src={getAssetUrl('assets/logo-mcit.png')}
          alt="Ministry of Communications and Information Technology"
          style={{ height: 128, objectFit: 'contain' }}
        />
        <span
          style={{
            width: 2,
            height: 120,
            background:
              'linear-gradient(180deg, rgba(0,0,102,0), rgba(0,0,102,0.18), rgba(0,0,102,0))',
          }}
        />
        <img
          src={getAssetUrl('assets/logo-ema.png')}
          alt="Egyptian Military Academy"
          style={{ height: 140, objectFit: 'contain' }}
        />
        <span
          style={{
            width: 2,
            height: 120,
            background:
              'linear-gradient(180deg, rgba(0,0,102,0), rgba(0,0,102,0.18), rgba(0,0,102,0))',
          }}
        />
        <span
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: 'rgba(0,0,102,0.6)',
            }}
          >
            POWERED BY
          </span>
          <img
            src={getAssetUrl('assets/logo-5dvr.png')}
            alt="5dVR — Future Reality"
            style={{ height: 104, objectFit: 'contain' }}
          />
        </span>
      </div>
    </div>
  );
};
