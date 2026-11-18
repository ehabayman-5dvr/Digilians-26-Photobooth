import React, { useEffect, useRef, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  const posRef = useRef({ x: -100, y: -100 });
  const ringPosRef = useRef({ x: -100, y: -100 });

  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    let rafId = 0;

    const animate = () => {
      const lerp = 0.22;
      ringPosRef.current.x += (posRef.current.x - ringPosRef.current.x) * lerp;
      ringPosRef.current.y += (posRef.current.y - ringPosRef.current.y) * lerp;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPosRef.current.x}px, ${ringPosRef.current.y}px, 0)`;
      }
      rafId = window.requestAnimationFrame(animate);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') {
        setVisible(false);
        document.body.classList.remove('dg-custom-cursor-active');
        return;
      }

      posRef.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      setVisible(true);
      document.body.classList.add('dg-custom-cursor-active');

      const target = e.target as HTMLElement | null;
      const isInteractive = Boolean(
        target?.closest('button, a, [role="button"], input, select, textarea, label')
      );
      setHovering(isInteractive);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') setClicking(true);
    };

    const onPointerUp = () => setClicking(false);

    const onMouseLeave = () => {
      setVisible(false);
      document.body.classList.remove('dg-custom-cursor-active');
    };

    rafId = window.requestAnimationFrame(animate);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.body.classList.remove('dg-custom-cursor-active');
    };
  }, []);

  if (!visible) return null;

  const ringScale = clicking ? 0.78 : hovering ? 1.45 : 1;

  return (
    <>
      {/* Trailing Glowing Ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: -18,
          top: -18,
          width: 36,
          height: 36,
          pointerEvents: 'none',
          zIndex: 99999,
          willChange: 'transform',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `1.5px solid ${hovering ? '#00FF99' : '#3399FF'}`,
            background: hovering ? 'rgba(0, 255, 153, 0.12)' : 'rgba(51, 153, 255, 0.06)',
            boxShadow: hovering
              ? '0 0 18px rgba(0, 255, 153, 0.65), inset 0 0 8px rgba(0, 255, 153, 0.25)'
              : '0 0 14px rgba(51, 153, 255, 0.45)',
            transform: `scale(${ringScale})`,
            transition: 'transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.2s, background 0.2s, box-shadow 0.2s',
          }}
        />
      </div>

      {/* Instant Center Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: -4,
          top: -4,
          width: 8,
          height: 8,
          pointerEvents: 'none',
          zIndex: 100000,
          willChange: 'transform',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: clicking ? '#FFFFFF' : '#00FF99',
            boxShadow: '0 0 12px #00FF99, 0 0 4px #FFFFFF',
            transform: `scale(${clicking ? 1.4 : hovering ? 0.75 : 1})`,
            transition: 'transform 0.14s ease, background 0.14s ease',
          }}
        />
      </div>
    </>
  );
};
