import React, { useState } from 'react';

interface VirtualKeyboardProps {
  visible: boolean;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onClose: () => void;
}

const ROWS_LOWER = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '-'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', '.', '_', '/'],
];

const ROWS_UPPER = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '@', '#', '?'],
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  visible,
  onKeyPress,
  onBackspace,
  onClear,
  onClose,
}) => {
  const [shift, setShift] = useState(false);

  if (!visible) return null;

  const rows = shift ? ROWS_UPPER : ROWS_LOWER;

  const keyBtnStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 38,
    height: 44,
    borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.16)',
    background: 'rgba(30, 41, 59, 0.95)',
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      style={{
        padding: 12,
        background: '#0B1120',
        borderTop: '1px solid rgba(51, 153, 255, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {rows.map((row, rIdx) => (
        <div key={rIdx} style={{ display: 'flex', gap: 6 }}>
          {row.map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => onKeyPress(ch)}
              style={keyBtnStyle}
            >
              {ch}
            </button>
          ))}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
        <button
          type="button"
          onClick={() => setShift((s) => !s)}
          style={{
            ...keyBtnStyle,
            flex: 1.3,
            background: shift ? '#3399FF' : 'rgba(51, 65, 85, 0.95)',
          }}
        >
          Shift
        </button>
        <button
          type="button"
          onClick={() => onKeyPress(' ')}
          style={{ ...keyBtnStyle, flex: 3 }}
        >
          Space
        </button>
        <button
          type="button"
          onClick={onBackspace}
          style={{ ...keyBtnStyle, flex: 1.4, background: 'rgba(71, 85, 105, 0.95)' }}
        >
          ⌫ Back
        </button>
        <button
          type="button"
          onClick={onClear}
          style={{ ...keyBtnStyle, flex: 1.1, background: 'rgba(127, 29, 29, 0.8)' }}
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onClose}
          style={{
            ...keyBtnStyle,
            flex: 1.2,
            background: '#00FF99',
            color: '#000066',
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
};
