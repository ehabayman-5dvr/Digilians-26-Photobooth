import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Camera,
  Cpu,
  Download,
  Eye,
  EyeOff,
  Keyboard,
  Lock,
  Minus,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Save,
  Settings,
  Sliders,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  DashboardCloudConfig,
  LocalOperatorSettings,
  PrinterDeviceInfo,
} from '../types/photobooth';
import { DEFAULT_OPERATOR_SETTINGS } from '../services/configService';
import { LEARNING_PATHS } from '../data/pathsConfig';
import { dispatchPhysicalPrint, getAvailablePrinters } from '../services/printService';
import { getAssetUrl } from '../utils/assetHelper';
import { VirtualKeyboard } from './VirtualKeyboard';

interface OperatorModalProps {
  isOpen: boolean;
  cloudConfig: DashboardCloudConfig;
  lastSyncedAt: string | null;
  cloudSyncError: string | null;
  localSettings: LocalOperatorSettings;
  onSyncCloudNow: () => Promise<void>;
  onSaveLocalSettings: (next: LocalOperatorSettings) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

type AdminTab = 'ai' | 'camera' | 'printer' | 'prompts' | 'system';

type EditableField =
  | 'unlockInput'
  | 'operatorPassword'
  | 'photoViewerUrl'
  | 'printScaleDownPercent'
  | 'printTopPaddingPx'
  | 'printBottomPaddingPx'
  | 'printLeftPaddingPx'
  | 'printRightPaddingPx'
  | 'printCopies'
  | 'countdownSeconds'
  | 'previewAutoProceedSeconds'
  | 'eraSelectionTimeoutSeconds'
  | 'resultIdleTimeoutSeconds';

export const OperatorModal: React.FC<OperatorModalProps> = ({
  isOpen,
  cloudConfig,
  lastSyncedAt,
  cloudSyncError,
  localSettings,
  onSyncCloudNow,
  onSaveLocalSettings,
  onClose,
}) => {
  const [draft, setDraft] = useState<LocalOperatorSettings>(localSettings);
  const [activeTab, setActiveTab] = useState<AdminTab>('ai');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockInput, setUnlockInput] = useState('');
  const [unlockError, setUnlockError] = useState(false);
  const [showGatePassword, setShowGatePassword] = useState(false);
  const [showSettingPassword, setShowSettingPassword] = useState(false);

  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [printers, setPrinters] = useState<PrinterDeviceInfo[]>([]);
  const [printerSlots, setPrinterSlots] = useState<string[]>(() => {
    const names = localSettings.printerNames?.length
      ? localSettings.printerNames
      : localSettings.selectedPrinterName
      ? [localSettings.selectedPrinterName]
      : [];
    return names.length >= 2 ? [...names] : [...names, ...Array(2 - names.length).fill('')];
  });
  const [refreshingPrinters, setRefreshingPrinters] = useState(false);
  const [testPrintStatus, setTestPrintStatus] = useState<string | null>(null);
  const [jsonStatusMessage, setJsonStatusMessage] = useState<string | null>(null);

  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [activeField, setActiveField] = useState<EditableField | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const refreshDevicesAndPrinters = async () => {
    setRefreshingPrinters(true);
    try {
      const devs = await navigator.mediaDevices?.enumerateDevices();
      setCameras((devs || []).filter((d) => d.kind === 'videoinput'));
    } catch {
      setCameras([]);
    }
    try {
      const list = await getAvailablePrinters();
      setPrinters(list);
    } catch {
      setPrinters([]);
    }
    setRefreshingPrinters(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    setDraft(localSettings);
    const names = localSettings.printerNames?.length
      ? localSettings.printerNames
      : localSettings.selectedPrinterName
      ? [localSettings.selectedPrinterName]
      : [];
    setPrinterSlots(names.length >= 2 ? [...names] : [...names, ...Array(2 - names.length).fill('')]);
    setSaveError(null);
    setSavedBanner(false);
    setTestPrintStatus(null);
    setJsonStatusMessage(null);
    setUnlockInput('');
    setUnlockError(false);
    setShowGatePassword(false);

    const hasPassword = Boolean(localSettings.operatorPassword?.trim());
    setIsUnlocked(!hasPassword);
    setActiveField(hasPassword ? 'unlockInput' : null);
    setKeyboardVisible(hasPassword);

    void onSyncCloudNow();
    void refreshDevicesAndPrinters();
  }, [isOpen]);

  if (!isOpen) return null;

  const expectedPassword = (localSettings.operatorPassword || DEFAULT_OPERATOR_SETTINGS.operatorPassword || '12345').trim();

  const handleUnlockSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (unlockInput.trim() === expectedPassword) {
      setIsUnlocked(true);
      setUnlockError(false);
      setUnlockInput('');
      setKeyboardVisible(false);
      setActiveField(null);
    } else {
      setUnlockError(true);
      setUnlockInput('');
    }
  };

  const applyVirtualKey = (transform: (cur: string) => string) => {
    if (!activeField) return;
    if (activeField === 'unlockInput') {
      setUnlockInput((prev) => transform(prev));
      return;
    }
    if (activeField === 'operatorPassword' || activeField === 'photoViewerUrl') {
      setDraft((prev) => ({ ...prev, [activeField]: transform(String(prev[activeField] || '')) }));
      return;
    }
    const numStr = transform(String(draft[activeField] ?? ''));
    const parsed = Number(numStr);
    setDraft((prev) => ({
      ...prev,
      [activeField]: numStr === '' ? ('' as any) : Number.isFinite(parsed) ? parsed : 0,
    }));
  };

  const movePrinterSlot = (index: number, direction: -1 | 1) => {
    setPrinterSlots((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSync = async () => {
    setSyncing(true);
    await onSyncCloudNow();
    setSyncing(false);
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (saving) return;
    setSaving(true);
    setSaveError(null);

    const activePrinters = printerSlots.map((n) => n.trim()).filter(Boolean);
    const updated: LocalOperatorSettings = {
      ...draft,
      operatorPassword: draft.operatorPassword?.trim() || '',
      printFillColor: draft.printFillColor === 'white' ? 'white' : 'black',
      printScaleDownPercent: Math.max(0, Math.min(35, Number(draft.printScaleDownPercent ?? 0))),
      printTopPaddingPx: Math.max(0, Math.min(300, Number(draft.printTopPaddingPx) || 0)),
      printBottomPaddingPx: Math.max(0, Math.min(300, Number(draft.printBottomPaddingPx) || 0)),
      printLeftPaddingPx: Math.max(0, Math.min(300, Number(draft.printLeftPaddingPx) || 0)),
      printRightPaddingPx: Math.max(0, Math.min(300, Number(draft.printRightPaddingPx) || 0)),
      printCopies: Math.max(1, Math.min(10, Number(draft.printCopies) || 1)),
      countdownSeconds: Math.max(1, Math.min(10, Number(draft.countdownSeconds) || 3)),
      previewAutoProceedSeconds: Math.max(2, Math.min(20, Number(draft.previewAutoProceedSeconds) || 5)),
      eraSelectionTimeoutSeconds: Math.max(10, Math.min(300, Number(draft.eraSelectionTimeoutSeconds) || 60)),
      resultIdleTimeoutSeconds: Math.max(15, Math.min(300, Number(draft.resultIdleTimeoutSeconds) || 120)),
      printerNames: activePrinters,
      selectedPrinterName: activePrinters[0] || '',
    };

    const res = await onSaveLocalSettings(updated);
    setSaving(false);
    if (res.success) {
      setDraft(updated);
      onClose();
    } else {
      setSaveError(res.error || 'Failed to save operator-settings.json');
    }
  };

  const handleResetDefaults = async () => {
    const def = { ...DEFAULT_OPERATOR_SETTINGS };
    setDraft(def);
    setPrinterSlots([def.selectedPrinterName || '', '']);
    await onSaveLocalSettings(def);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2000);
  };

  const handleTestPrint = async () => {
    setTestPrintStatus('Sending test frame to printer...');
    try {
      const frameRes = await fetch(getAssetUrl('assets/frame.png'));
      const blob = await frameRes.blob();
      const base64Frame = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Failed to read frame.png'));
        reader.readAsDataURL(blob);
      });

      const activePrinters = printerSlots.map((n) => n.trim()).filter(Boolean);
      const res = await dispatchPhysicalPrint(
        base64Frame,
        {
          ...draft,
          printerNames: activePrinters,
          selectedPrinterName: activePrinters[0] || '',
          printCopies: 1,
        },
        true
      );
      if (res.success) {
        setTestPrintStatus(`Test print dispatched to ${res.printerUsed || 'default printer'}!`);
      } else {
        setTestPrintStatus(`Test print failed: ${res.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setTestPrintStatus(`Test print failed: ${err?.message || 'Unknown error'}`);
    }
    setTimeout(() => setTestPrintStatus(null), 4000);
  };

  const handleClearPrinterQueue = async () => {
    setTestPrintStatus('Clearing stuck print jobs...');
    try {
      const activePrinters = printerSlots.map((n) => n.trim()).filter(Boolean);
      if (window.electronAPI?.clearPrinterQueue) {
        await window.electronAPI.clearPrinterQueue(activePrinters[0] || undefined);
        await refreshDevicesAndPrinters();
        setTestPrintStatus('Printer queue cleared successfully!');
      } else {
        setTestPrintStatus('Queue cleanup requires Electron runtime.');
      }
    } catch (err: any) {
      setTestPrintStatus(`Queue cleanup error: ${err?.message || 'Unknown error'}`);
    }
    setTimeout(() => setTestPrintStatus(null), 4000);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'operator-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    setJsonStatusMessage('Exported operator-settings.json');
    setTimeout(() => setJsonStatusMessage(null), 3000);
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const merged = { ...DEFAULT_OPERATOR_SETTINGS, ...parsed };
      setDraft(merged);
      const names = merged.printerNames?.length
        ? merged.printerNames
        : merged.selectedPrinterName
        ? [merged.selectedPrinterName]
        : [];
      setPrinterSlots(names.length >= 2 ? [...names] : [...names, ...Array(2 - names.length).fill('')]);
      await onSaveLocalSettings(merged);
      setJsonStatusMessage(`Imported ${file.name} successfully!`);
    } catch (err: any) {
      setJsonStatusMessage(`Invalid JSON file: ${err?.message || 'Parse error'}`);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setJsonStatusMessage(null), 4000);
  };

  const bindField = (field: EditableField) => ({
    onFocus: () => {
      setActiveField(field);
      setKeyboardVisible(true);
    },
  });

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid rgba(51, 153, 255, 0.35)',
    background: '#08102A',
    color: '#FFFFFF',
    fontSize: 14,
  };

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    color: '#8FC8FF',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  const cardStyle: React.CSSProperties = {
    padding: 16,
    borderRadius: 14,
    background: 'rgba(15, 23, 42, 0.85)',
    border: '1px solid rgba(51, 153, 255, 0.25)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  };

  const aiKeyReady = Boolean(
    cloudConfig.aiModelProvider === 'gemini' ? cloudConfig.geminiApiKey : cloudConfig.openaiApiKey
  );
  const cloudinaryReady = Boolean(
    cloudConfig.cloudinaryCloudName && cloudConfig.cloudinaryApiKey && cloudConfig.cloudinaryApiSecret
  );

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(2, 6, 23, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        direction: 'ltr',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Underlying Panel (Blurred when locked) */}
      <form
        onSubmit={handleSave}
        style={{
          width: 980,
          maxWidth: '96vw',
          maxHeight: '92vh',
          background: '#060B24',
          border: '1.5px solid rgba(51, 153, 255, 0.5)',
          borderRadius: 24,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#F8FAFC',
          boxShadow: '0 25px 80px rgba(0,0,0,0.85)',
          filter: !isUnlocked ? 'blur(16px) brightness(0.6)' : undefined,
          pointerEvents: !isUnlocked ? 'none' : 'auto',
          transition: 'filter 0.25s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            background: 'linear-gradient(90deg, #070E30, #0D1B4C, #070E30)',
            borderBottom: '1px solid rgba(51, 153, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'rgba(0, 255, 153, 0.14)',
                border: '1px solid rgba(0, 255, 153, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Settings size={22} color="#00FF99" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
                5DVR · DIGILIANS OPERATOR SETTINGS (F2)
              </h2>
              <span style={{ fontSize: 12, color: '#8FC8FF' }}>
                Shortcut: F2 or 5× Top-Left Tap
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              onClick={() => setKeyboardVisible((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid rgba(51, 153, 255, 0.45)',
                background: keyboardVisible ? '#3399FF' : 'rgba(255,255,255,0.06)',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Keyboard size={15} />
              Touch Keyboard
            </button>

            <div
              style={{
                padding: '7px 12px',
                borderRadius: 10,
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(51, 153, 255, 0.3)',
                fontSize: 12,
                display: 'flex',
                gap: 10,
              }}
            >
              <span>
                Gen: <strong style={{ color: '#00FF99' }}>{cloudConfig.currentGenerations}</strong>
              </span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span>
                Print: <strong style={{ color: '#8FC8FF' }}>{cloudConfig.totalPrintedCopies}</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: 8,
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.06)',
                color: '#FFFFFF',
                display: 'flex',
              }}
              title="Close (Re-locks Password)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 5 Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            padding: '10px 24px 0',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.03)',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'ai', label: 'Experience & AI', icon: Cpu },
            { id: 'camera', label: 'Camera & Mount', icon: Camera },
            { id: 'printer', label: 'Printers & Padding', icon: Printer },
            { id: 'prompts', label: '5 Paths Prompts', icon: Sparkles },
            { id: 'system', label: 'Kiosk, Restart & JSON', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as AdminTab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 16px',
                  borderRadius: '10px 10px 0 0',
                  border: active ? '1px solid rgba(51,153,255,0.5)' : '1px solid transparent',
                  borderBottom: 'none',
                  background: active ? '#060B24' : 'transparent',
                  color: active ? '#00FF99' : '#94A3B8',
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* TAB 1: EXPERIENCE & AI */}
          {activeTab === 'ai' && (
            <>
              <div
                style={{
                  padding: 18,
                  borderRadius: 16,
                  background: 'rgba(51, 153, 255, 0.08)',
                  border: '1px solid rgba(51, 153, 255, 0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <strong style={{ fontSize: 15, color: '#FFFFFF' }}>{cloudConfig.projectName}</strong>
                      <span
                        style={{
                          padding: '2px 10px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          background: cloudConfig.isActive ? 'rgba(0,255,153,0.18)' : 'rgba(248,113,113,0.2)',
                          color: cloudConfig.isActive ? '#00FF99' : '#FCA5A5',
                        }}
                      >
                        {cloudConfig.isActive ? 'In Use' : 'Finished'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                      {lastSyncedAt
                        ? `Last synced: ${new Date(lastSyncedAt).toLocaleString()}`
                        : cloudSyncError
                        ? `Offline cache active (${cloudSyncError})`
                        : 'Loaded from local cache'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSync}
                    disabled={syncing}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '9px 16px',
                      borderRadius: 10,
                      border: '1px solid rgba(51,153,255,0.6)',
                      background: 'rgba(51,153,255,0.2)',
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    <RefreshCw size={15} />
                    {syncing ? 'Syncing…' : 'Sync Cloud Config Now'}
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: 13 }}>
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgba(0,0,0,0.3)' }}>
                    <div style={{ fontSize: 11, color: '#8FC8FF' }}>LOCKED AI MODEL</div>
                    <div style={{ fontWeight: 700, marginTop: 4 }}>
                      {cloudConfig.openaiModel} ({cloudConfig.aiModelProvider})
                    </div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgba(0,0,0,0.3)' }}>
                    <div style={{ fontSize: 11, color: '#8FC8FF' }}>PORTRAIT COUNTER</div>
                    <div style={{ fontWeight: 700, marginTop: 4 }}>
                      {cloudConfig.currentGenerations} / {cloudConfig.dailyLimit}
                    </div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 10, background: 'rgba(0,0,0,0.3)' }}>
                    <div style={{ fontSize: 11, color: '#8FC8FF' }}>CLOUDINARY FOLDER</div>
                    <div style={{ fontWeight: 700, marginTop: 4 }}>{cloudConfig.cloudinaryFolder}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                  <span
                    style={{
                      padding: '5px 10px',
                      borderRadius: 8,
                      background: aiKeyReady ? 'rgba(0,255,153,0.15)' : 'rgba(255,255,255,0.06)',
                      color: aiKeyReady ? '#00FF99' : '#94A3B8',
                      fontWeight: 600,
                    }}
                  >
                    {cloudConfig.aiModelProvider === 'gemini' ? 'Gemini' : 'OpenAI'} Key: {aiKeyReady ? 'Synced ✓' : 'Missing'}
                  </span>
                  <span
                    style={{
                      padding: '5px 10px',
                      borderRadius: 8,
                      background: cloudinaryReady ? 'rgba(0,255,153,0.15)' : 'rgba(255,255,255,0.06)',
                      color: cloudinaryReady ? '#00FF99' : '#94A3B8',
                      fontWeight: 600,
                    }}
                  >
                    Cloudinary Keys: {cloudinaryReady ? 'Synced ✓' : 'Missing'}
                  </span>
                </div>
              </div>

              <div style={cardStyle}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Preview Mode (Dry-Run Testing)</div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                    Skips live AI API calls and telemetry counters so you can test camera, frames, and printers offline.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={draft.previewMode}
                  onChange={(e) => setDraft({ ...draft, previewMode: e.target.checked })}
                  style={{ width: 22, height: 22 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <label style={labelStyle}>
                  OpenAI Image Quality {cloudConfig.aiModelProvider === 'gemini' ? '(Ignored for Gemini)' : ''}
                  <select
                    style={inputStyle}
                    disabled={cloudConfig.aiModelProvider === 'gemini'}
                    value={draft.imageQuality}
                    onChange={(e) =>
                      setDraft({ ...draft, imageQuality: e.target.value as 'low' | 'medium' | 'high' })
                    }
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </label>

                <label style={labelStyle}>
                  Mobile Photo Viewer URL
                  <input
                    type="text"
                    style={inputStyle}
                    value={draft.photoViewerUrl}
                    onChange={(e) => setDraft({ ...draft, photoViewerUrl: e.target.value })}
                    {...bindField('photoViewerUrl')}
                  />
                </label>
              </div>
            </>
          )}

          {/* TAB 2: CAMERA & MOUNT */}
          {activeTab === 'camera' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#8FC8FF', textTransform: 'uppercase' }}>
                    Camera Device
                  </span>
                  <button
                    type="button"
                    onClick={refreshDevicesAndPrinters}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: 'transparent',
                      border: 'none',
                      color: '#00FF99',
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    <RefreshCw size={13} /> Refresh Devices
                  </button>
                </div>
                <select
                  style={inputStyle}
                  value={draft.selectedCameraId}
                  onChange={(e) => setDraft({ ...draft, selectedCameraId: e.target.value })}
                >
                  <option value="">Default System Camera</option>
                  {cameras.map((cam, idx) => (
                    <option key={cam.deviceId || idx} value={cam.deviceId}>
                      {cam.label || `Camera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <label style={labelStyle}>
                  Camera Rotation
                  <select
                    style={inputStyle}
                    value={draft.cameraRotation}
                    onChange={(e) =>
                      setDraft({ ...draft, cameraRotation: Number(e.target.value) as -90 | 0 | 90 | 180 })
                    }
                  >
                    <option value={-90}>-90° · sideways kiosk mount</option>
                    <option value={0}>0° · upright camera</option>
                    <option value={90}>90°</option>
                    <option value={180}>180°</option>
                  </select>
                </label>

                <div style={cardStyle}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Mirror Camera</div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>Flips live feed horizontally (scaleX(-1)).</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.cameraMirror}
                    onChange={(e) => setDraft({ ...draft, cameraMirror: e.target.checked })}
                    style={{ width: 20, height: 20 }}
                  />
                </div>
              </div>

              <div style={cardStyle}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    Show &ldquo;Upload Test Photo&rdquo; Button on Capture Screen
                  </div>
                  <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
                    Disabled by default for guests. Enable during early venue setup without a physical camera.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(draft.enableTestImageUpload)}
                  onChange={(e) => setDraft({ ...draft, enableTestImageUpload: e.target.checked })}
                  style={{ width: 22, height: 22 }}
                />
              </div>
            </>
          )}

          {/* TAB 3: PRINTERS & PADDING */}
          {activeTab === 'printer' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={cardStyle}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Enable Photo Printing</div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>Show PRINT button on Result Screen.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.enablePrinting}
                    onChange={(e) => setDraft({ ...draft, enablePrinting: e.target.checked })}
                    style={{ width: 20, height: 20 }}
                  />
                </div>

                <div style={cardStyle}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Composite Frame.png Overlay</div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>Bake Digilians frame into 1200×1800 print & QR.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.compositeFrameAndLogos}
                    onChange={(e) => setDraft({ ...draft, compositeFrameAndLogos: e.target.checked })}
                    style={{ width: 20, height: 20 }}
                  />
                </div>

                <div style={cardStyle}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Single Print Per Session</div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>Prevents guests from printing twice per session.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.singlePrintPerSession}
                    onChange={(e) => setDraft({ ...draft, singlePrintPerSession: e.target.checked })}
                    style={{ width: 20, height: 20 }}
                  />
                </div>

                <div style={cardStyle}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Auto-Print on Result</div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>Dispatches print automatically on Result screen.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.autoPrintOnResult}
                    onChange={(e) => setDraft({ ...draft, autoPrintOnResult: e.target.checked })}
                    style={{ width: 20, height: 20 }}
                  />
                </div>
              </div>

              {/* Multi-Printer Priority Routing Slots */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(51, 153, 255, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#00FF99' }}>
                      Multi-Printer Priority Routing
                    </div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>
                      First ready printer receives the job; if all are busy, queues on the first connected printer.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      disabled={printerSlots.length >= 10}
                      onClick={() => setPrinterSlots((prev) => [...prev, ''])}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(51,153,255,0.45)',
                        background: 'rgba(51,153,255,0.15)',
                        color: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <Plus size={14} /> Add Printer
                    </button>
                    <button
                      type="button"
                      disabled={refreshingPrinters}
                      onClick={refreshDevicesAndPrinters}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '7px 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(255,255,255,0.06)',
                        color: '#8FC8FF',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      <RefreshCw size={14} />
                      {refreshingPrinters ? 'Checking…' : 'Refresh Printers'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {printerSlots.map((slotName, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 105, fontSize: 12, fontWeight: 600, color: '#8FC8FF' }}>
                        Photo printer {idx + 1}
                      </span>
                      <select
                        style={{ ...inputStyle, flex: 1 }}
                        value={slotName}
                        onChange={(e) =>
                          setPrinterSlots((prev) =>
                            prev.map((val, i) => (i === idx ? e.target.value : val))
                          )
                        }
                      >
                        <option value="">Select printer (or leave blank for OS Default)</option>
                        <option value="Canon SELPHY CP1500">Canon SELPHY CP1500</option>
                        <option value="DNP DP-QW410">DNP DP-QW410</option>
                        {slotName &&
                          slotName !== 'Canon SELPHY CP1500' &&
                          slotName !== 'DNP DP-QW410' &&
                          !printers.some((p) => p.name === slotName) && (
                            <option value={slotName}>{slotName} · not detected</option>
                          )}
                        {printers
                          .filter((p) => p.name !== 'Canon SELPHY CP1500' && p.name !== 'DNP DP-QW410')
                          .map((p) => (
                            <option key={p.name} value={p.name}>
                              {p.displayName || p.name} · {p.status === 0 ? 'ready' : `busy/offline (${p.status})`}
                            </option>
                          ))}
                      </select>

                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => movePrinterSlot(idx, -1)}
                        style={{ padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#FFFFFF', opacity: idx === 0 ? 0.35 : 1 }}
                        title="Move Up"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === printerSlots.length - 1}
                        onClick={() => movePrinterSlot(idx, 1)}
                        style={{ padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#FFFFFF', opacity: idx === printerSlots.length - 1 ? 0.35 : 1 }}
                        title="Move Down"
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        type="button"
                        disabled={printerSlots.length <= 1}
                        onClick={() => setPrinterSlots((prev) => prev.filter((_, i) => i !== idx))}
                        style={{ padding: 8, borderRadius: 8, border: '1px solid rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.12)', color: '#FCA5A5', opacity: printerSlots.length <= 1 ? 0.35 : 1 }}
                        title="Remove Slot"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Print Fill Color, Scale Down %, Padding (px) & Copies */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                <label style={labelStyle}>
                  Print Fill Color
                  <select
                    style={inputStyle}
                    value={draft.printFillColor === 'white' ? 'white' : 'black'}
                    onChange={(e) =>
                      setDraft({ ...draft, printFillColor: e.target.value === 'white' ? 'white' : 'black' })
                    }
                  >
                    <option value="black">Black (#000)</option>
                    <option value="white">White (#FFF)</option>
                  </select>
                </label>

                <label style={labelStyle}>
                  Scale Down (%)
                  <input
                    type="number"
                    min={0}
                    max={35}
                    step={0.5}
                    style={inputStyle}
                    value={draft.printScaleDownPercent}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setDraft({
                        ...draft,
                        printScaleDownPercent: raw === '' ? ('' as any) : Number(raw),
                      });
                    }}
                    onBlur={() =>
                      setDraft((prev) => ({
                        ...prev,
                        printScaleDownPercent: Math.max(0, Math.min(35, Number(prev.printScaleDownPercent ?? 0))),
                      }))
                    }
                    {...bindField('printScaleDownPercent')}
                  />
                </label>

                <label style={labelStyle}>
                  Print Copies
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      onClick={() => setDraft((p) => ({ ...p, printCopies: Math.max(1, (Number(p.printCopies) || 1) - 1) }))}
                      style={{ padding: '0 10px', borderRadius: 8, border: '1px solid rgba(51,153,255,0.35)', background: '#08102A', color: '#FFFFFF' }}
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      style={{ ...inputStyle, textAlign: 'center' }}
                      value={draft.printCopies}
                      onChange={(e) => {
                        const raw = e.target.value;
                        setDraft({
                          ...draft,
                          printCopies: raw === '' ? ('' as any) : Number(raw),
                        });
                      }}
                      onBlur={() =>
                        setDraft((prev) => ({
                          ...prev,
                          printCopies: Math.max(1, Math.min(10, Number(prev.printCopies) || 1)),
                        }))
                      }
                      {...bindField('printCopies')}
                    />
                    <button
                      type="button"
                      onClick={() => setDraft((p) => ({ ...p, printCopies: Math.min(10, (Number(p.printCopies) || 1) + 1) }))}
                      style={{ padding: '0 10px', borderRadius: 8, border: '1px solid rgba(51,153,255,0.35)', background: '#08102A', color: '#FFFFFF' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </label>

                <label style={labelStyle}>
                  Top Padding (px)
                  <input
                    type="number"
                    min={0}
                    max={300}
                    style={inputStyle}
                    value={draft.printTopPaddingPx}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setDraft({ ...draft, printTopPaddingPx: raw === '' ? ('' as any) : Number(raw) });
                    }}
                    onBlur={() =>
                      setDraft((p) => ({ ...p, printTopPaddingPx: Math.max(0, Math.min(300, Number(p.printTopPaddingPx) || 0)) }))
                    }
                    {...bindField('printTopPaddingPx')}
                  />
                </label>

                <label style={labelStyle}>
                  Bottom Padding (px)
                  <input
                    type="number"
                    min={0}
                    max={300}
                    style={inputStyle}
                    value={draft.printBottomPaddingPx}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setDraft({ ...draft, printBottomPaddingPx: raw === '' ? ('' as any) : Number(raw) });
                    }}
                    onBlur={() =>
                      setDraft((p) => ({ ...p, printBottomPaddingPx: Math.max(0, Math.min(300, Number(p.printBottomPaddingPx) || 0)) }))
                    }
                    {...bindField('printBottomPaddingPx')}
                  />
                </label>

                <label style={labelStyle}>
                  Left Padding (px)
                  <input
                    type="number"
                    min={0}
                    max={300}
                    style={inputStyle}
                    value={draft.printLeftPaddingPx}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setDraft({ ...draft, printLeftPaddingPx: raw === '' ? ('' as any) : Number(raw) });
                    }}
                    onBlur={() =>
                      setDraft((p) => ({ ...p, printLeftPaddingPx: Math.max(0, Math.min(300, Number(p.printLeftPaddingPx) || 0)) }))
                    }
                    {...bindField('printLeftPaddingPx')}
                  />
                </label>

                <label style={labelStyle}>
                  Right Padding (px)
                  <input
                    type="number"
                    min={0}
                    max={300}
                    style={inputStyle}
                    value={draft.printRightPaddingPx}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setDraft({ ...draft, printRightPaddingPx: raw === '' ? ('' as any) : Number(raw) });
                    }}
                    onBlur={() =>
                      setDraft((p) => ({ ...p, printRightPaddingPx: Math.max(0, Math.min(300, Number(p.printRightPaddingPx) || 0)) }))
                    }
                    {...bindField('printRightPaddingPx')}
                  />
                </label>
              </div>

              {/* Test Print & Clear Queue */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleTestPrint}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    borderRadius: 10,
                    border: '1px solid rgba(51,153,255,0.6)',
                    background: 'rgba(51,153,255,0.18)',
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <Printer size={16} /> Send Test Print
                </button>
                <button
                  type="button"
                  onClick={handleClearPrinterQueue}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    borderRadius: 10,
                    border: '1px solid rgba(248,113,113,0.45)',
                    background: 'rgba(248,113,113,0.14)',
                    color: '#FCA5A5',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <Trash2 size={16} /> Clear Print Queue
                </button>
                {testPrintStatus && (
                  <span style={{ fontSize: 13, color: '#00FF99', fontWeight: 600 }}>{testPrintStatus}</span>
                )}
              </div>
            </>
          )}

          {/* TAB 4: 5 PATHS PROMPTS */}
          {activeTab === 'prompts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>
                Overview of the 5 learning paths and their 14 active scene/outfit variations configured in{' '}
                <code style={{ color: '#00FF99' }}>src/data/pathsConfig.ts</code>:
              </div>
              {LEARNING_PATHS.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: 14,
                    borderRadius: 12,
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(51, 153, 255, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: 14, color: '#FFFFFF' }}>
                      {p.nameEn} · <span style={{ color: '#8FC8FF' }}>{p.nameAr}</span>
                    </strong>
                    <span style={{ fontSize: 12, color: '#00FF99', fontWeight: 600 }}>
                      {p.scenes.length} variants
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#CBD5E1' }}>
                    {p.scenes.map((s) => s.name).join('  •  ')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: KIOSK, RESTART & JSON */}
          {activeTab === 'system' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                <label style={labelStyle}>
                  Countdown (s)
                  <input
                    type="number"
                    min={1}
                    max={10}
                    style={inputStyle}
                    value={draft.countdownSeconds}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setDraft({ ...draft, countdownSeconds: raw === '' ? ('' as any) : Number(raw) });
                    }}
                    onBlur={() =>
                      setDraft((p) => ({ ...p, countdownSeconds: Math.max(1, Math.min(10, Number(p.countdownSeconds) || 3)) }))
                    }
                    {...bindField('countdownSeconds')}
                  />
                </label>
                <label style={labelStyle}>
                  Review Auto (s)
                  <input
                    type="number"
                    min={2}
                    max={20}
                    style={inputStyle}
                    value={draft.previewAutoProceedSeconds}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setDraft({ ...draft, previewAutoProceedSeconds: raw === '' ? ('' as any) : Number(raw) });
                    }}
                    onBlur={() =>
                      setDraft((p) => ({ ...p, previewAutoProceedSeconds: Math.max(2, Math.min(20, Number(p.previewAutoProceedSeconds) || 5)) }))
                    }
                    {...bindField('previewAutoProceedSeconds')}
                  />
                </label>
                <label style={labelStyle}>
                  Path Idle (s)
                  <input
                    type="number"
                    min={10}
                    max={300}
                    style={inputStyle}
                    value={draft.eraSelectionTimeoutSeconds}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setDraft({ ...draft, eraSelectionTimeoutSeconds: raw === '' ? ('' as any) : Number(raw) });
                    }}
                    onBlur={() =>
                      setDraft((p) => ({ ...p, eraSelectionTimeoutSeconds: Math.max(10, Math.min(300, Number(p.eraSelectionTimeoutSeconds) || 60)) }))
                    }
                    {...bindField('eraSelectionTimeoutSeconds')}
                  />
                </label>
                <label style={labelStyle}>
                  Result Idle (s)
                  <input
                    type="number"
                    min={15}
                    max={300}
                    style={inputStyle}
                    value={draft.resultIdleTimeoutSeconds}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setDraft({ ...draft, resultIdleTimeoutSeconds: raw === '' ? ('' as any) : Number(raw) });
                    }}
                    onBlur={() =>
                      setDraft((p) => ({ ...p, resultIdleTimeoutSeconds: Math.max(15, Math.min(300, Number(p.resultIdleTimeoutSeconds) || 120)) }))
                    }
                    {...bindField('resultIdleTimeoutSeconds')}
                  />
                </label>
              </div>

              <div style={cardStyle}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>UI &amp; Shutter Sound Effects</div>
                  <div style={{ fontSize: 12, color: '#94A3B8' }}>Subtle audio feedback on taps, countdown, shutter, and result.</div>
                </div>
                <input
                  type="checkbox"
                  checked={draft.soundEnabled !== false}
                  onChange={(e) => setDraft({ ...draft, soundEnabled: e.target.checked })}
                  style={{ width: 20, height: 20 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <label style={labelStyle}>
                  Operator Password (empty disables lock)
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showSettingPassword ? 'text' : 'password'}
                      style={{ ...inputStyle, paddingRight: 40 }}
                      value={draft.operatorPassword}
                      onChange={(e) => setDraft({ ...draft, operatorPassword: e.target.value })}
                      placeholder="Default: 12345"
                      {...bindField('operatorPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSettingPassword((v) => !v)}
                      style={{
                        position: 'absolute',
                        right: 10,
                        background: 'transparent',
                        border: 'none',
                        color: '#94A3B8',
                        display: 'flex',
                      }}
                    >
                      {showSettingPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>

                <div style={cardStyle}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Lock Fullscreen Kiosk Mode</div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>Suppresses Escape/Alt when locked.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.kioskLocked}
                    onChange={(e) => setDraft({ ...draft, kioskLocked: e.target.checked })}
                    style={{ width: 20, height: 20 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
                {window.electronAPI?.exitKiosk && (
                  <button
                    type="button"
                    onClick={() => window.electronAPI?.exitKiosk()}
                    style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#E2E8F0', fontSize: 13, fontWeight: 600 }}
                  >
                    Exit Fullscreen Window
                  </button>
                )}
                {window.electronAPI?.relaunchApp && (
                  <button
                    type="button"
                    onClick={() => window.electronAPI?.relaunchApp()}
                    style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(51,153,255,0.45)', background: 'rgba(51,153,255,0.15)', color: '#8FC8FF', fontSize: 13, fontWeight: 600 }}
                  >
                    Relaunch App Now
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleExportJson}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#E2E8F0', fontSize: 13, fontWeight: 600 }}
                >
                  <Download size={15} /> Export JSON
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#E2E8F0', fontSize: 13, fontWeight: 600 }}
                >
                  <Upload size={15} /> Import JSON
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  style={{ display: 'none' }}
                  onChange={handleImportJson}
                />
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.12)', color: '#FCA5A5', fontSize: 13, fontWeight: 600 }}
                >
                  <RotateCcw size={15} /> Reset Defaults
                </button>
              </div>
              {jsonStatusMessage && (
                <div style={{ fontSize: 13, color: '#00FF99', fontWeight: 600 }}>{jsonStatusMessage}</div>
              )}
            </>
          )}

          {saveError && (
            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(239,68,68,0.2)', color: '#FCA5A5', fontSize: 13 }}>
              {saveError}
            </div>
          )}
        </div>

        {/* Touch VirtualKeyboard */}
        <VirtualKeyboard
          visible={isUnlocked && keyboardVisible}
          onKeyPress={(ch) => applyVirtualKey((cur) => cur + ch)}
          onBackspace={() => applyVirtualKey((cur) => cur.slice(0, -1))}
          onClear={() => applyVirtualKey(() => '')}
          onClose={() => setKeyboardVisible(false)}
        />

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 13, color: '#00FF99', fontWeight: 600 }}>
            {savedBanner ? '✓ Settings saved to operator-settings.json' : ''}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'transparent',
                color: '#E2E8F0',
                fontWeight: 600,
              }}
            >
              Close
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #00FF99, #3399FF)',
                color: '#000066',
                fontWeight: 700,
              }}
            >
              <Save size={16} />
              {saving ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>

      {/* Password Lock Gate Overlay */}
      {!isUnlocked && (
        <form
          onSubmit={handleUnlockSubmit}
          style={{
            position: 'fixed',
            zIndex: 10001,
            width: '100%',
            maxWidth: 560,
            background: '#08102A',
            border: '1.5px solid rgba(51, 153, 255, 0.55)',
            borderRadius: 20,
            overflow: 'hidden',
            color: '#F8FAFC',
            boxShadow: '0 24px 80px rgba(0,0,0,0.85)',
          }}
        >
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Lock size={20} color="#00FF99" />
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Operator Access (F2)</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'transparent',
                  color: '#CBD5E1',
                }}
              >
                Cancel
              </button>
            </div>

            <label style={labelStyle}>
              Enter Operator Password
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showGatePassword ? 'text' : 'password'}
                  autoFocus
                  style={{ ...inputStyle, paddingRight: 42 }}
                  value={unlockInput}
                  onChange={(e) => setUnlockInput(e.target.value)}
                  placeholder="Password…"
                  {...bindField('unlockInput')}
                />
                <button
                  type="button"
                  onClick={() => setShowGatePassword((v) => !v)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    background: 'transparent',
                    border: 'none',
                    color: '#94A3B8',
                    display: 'flex',
                  }}
                >
                  {showGatePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {unlockError && (
              <div style={{ fontSize: 13, color: '#FCA5A5', fontWeight: 600 }}>
                Incorrect operator password. Please try again.
              </div>
            )}

            <button
              type="submit"
              style={{
                padding: '12px 20px',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #00FF99, #3399FF)',
                color: '#000066',
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              Unlock Settings
            </button>
          </div>

          <VirtualKeyboard
            visible={keyboardVisible}
            onKeyPress={(ch) => applyVirtualKey((cur) => cur + ch)}
            onBackspace={() => applyVirtualKey((cur) => cur.slice(0, -1))}
            onClear={() => applyVirtualKey(() => '')}
            onClose={() => setKeyboardVisible(false)}
          />
        </form>
      )}
    </div>
  );
};
