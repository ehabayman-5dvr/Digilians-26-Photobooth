const { app, BrowserWindow, ipcMain, session, globalShortcut, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

let mainWindow = null;

function getStorageDir() {
  return process.env.PORTABLE_EXECUTABLE_DIR || app.getPath('userData');
}

function getOperatorSettingsPath() {
  return path.join(getStorageDir(), 'operator-settings.json');
}

function getCloudConfigCachePath() {
  return path.join(getStorageDir(), 'cloud-config.cache.json');
}

function atomicWriteJson(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmpPath = `${filePath}.tmp.${Date.now()}`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmpPath, filePath);
}

function readJsonSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[Main] Failed to read ${filePath}:`, err.message);
    return null;
  }
}

function buildCloudinaryContextString(fullPrompt, extra) {
  const sanitize = (str) =>
    String(str).replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/=/g, '\\=');

  const pairs = [];
  const trimmed = (fullPrompt || '').trim();
  if (trimmed) {
    const chunkSize = 900;
    for (let i = 0; i < trimmed.length; i += chunkSize) {
      const idx = Math.floor(i / chunkSize);
      pairs.push(`prompt_${idx}=${sanitize(trimmed.slice(i, i + chunkSize))}`);
    }
  }

  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v && k !== 'prompt') {
        pairs.push(`${k}=${sanitize(v)}`);
      }
    }
  }

  return pairs.join('|');
}

function createWindow() {
  const savedSettings = readJsonSafe(getOperatorSettingsPath());
  const startKiosk = savedSettings ? savedSettings.kioskLocked !== false : true;

  mainWindow = new BrowserWindow({
    width: 1080,
    height: 1920,
    icon: path.join(__dirname, '../build/icon.png'),
    fullscreen: startKiosk,
    kiosk: startKiosk,
    frame: true,
    autoHideMenuBar: true,
    backgroundColor: '#000066',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (startKiosk) {
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
  }

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      callback(true);
      return;
    }
    callback(false);
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (mainWindow && mainWindow.isKiosk() && (input.key === 'Escape' || input.key === 'Alt')) {
      event.preventDefault();
    }
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
  if (!app.isPackaged) {
    mainWindow.loadURL(devUrl).catch(() => {
      mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function toggleOperatorModal() {
  if (!mainWindow) return;
  mainWindow.webContents.send('toggle-admin');
}

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register('F2', () => {
    toggleOperatorModal();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// --- IPC Handlers ---

ipcMain.handle('get-operator-settings', () => {
  return readJsonSafe(getOperatorSettingsPath());
});

ipcMain.handle('save-operator-settings', (event, settings) => {
  try {
    atomicWriteJson(getOperatorSettingsPath(), settings);
    if (mainWindow) {
      const locked = settings.kioskLocked !== false;
      mainWindow.setKiosk(locked);
      mainWindow.setFullScreen(locked);
      mainWindow.setAlwaysOnTop(locked, 'screen-saver');
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-cloud-config-cache', () => {
  return readJsonSafe(getCloudConfigCachePath());
});

ipcMain.handle('save-cloud-config-cache', (event, config) => {
  try {
    atomicWriteJson(getCloudConfigCachePath(), config);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('exit-kiosk', () => {
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setKiosk(false);
    mainWindow.setFullScreen(false);
  }
});

ipcMain.handle('enter-kiosk', () => {
  if (mainWindow) {
    mainWindow.setKiosk(true);
    mainWindow.setFullScreen(true);
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
  }
});

ipcMain.handle('relaunch-app', () => {
  app.relaunch();
  app.exit(0);
});

ipcMain.handle('pick-test-image', async () => {
  if (!mainWindow) return null;
  const wasOnTop = mainWindow.isAlwaysOnTop();
  try {
    if (wasOnTop) mainWindow.setAlwaysOnTop(false);
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Test Photo',
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] }],
    });
    if (result.canceled || !result.filePaths.length) return null;
    const filePath = result.filePaths[0];
    const ext = path.extname(filePath).toLowerCase().replace('.', '') || 'jpeg';
    const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
    const buffer = fs.readFileSync(filePath);
    return {
      dataUrl: `data:${mime};base64,${buffer.toString('base64')}`,
      fileName: path.basename(filePath),
    };
  } finally {
    if (mainWindow && wasOnTop) {
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    }
  }
});

ipcMain.handle('save-local-photo', async (event, { dataUrl, type, eraId }) => {
  try {
    const dateStr = new Date().toISOString().slice(0, 10);
    const dir = path.join(getStorageDir(), 'photos', dateStr);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const match = String(dataUrl).match(/^data:image\/(\w+);base64,(.+)$/);
    if (!match) return { success: false, error: 'Invalid dataUrl' };

    const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    const buffer = Buffer.from(match[2], 'base64');
    const safeEra = (eraId || 'booth').replace(/[^a-z0-9-_]/gi, '_');
    const fileName = `${Date.now()}_${safeEra}_${type}.${ext}`;
    const fullPath = path.join(dir, fileName);
    fs.writeFileSync(fullPath, buffer);
    return { success: true, path: fullPath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-printers', async () => {
  if (!mainWindow) return [];
  try {
    const printers = await mainWindow.webContents.getPrintersAsync();
    return printers.map((p) => ({
      name: p.name,
      displayName: p.displayName || p.name,
      isDefault: !!p.isDefault,
      status: p.status,
    }));
  } catch (err) {
    console.warn('[Main] getPrintersAsync failed:', err.message);
    return [];
  }
});

ipcMain.handle('print-photo', async (event, payload) => {
  const {
    imageBase64,
    printerName,
    copies = 1,
    printFillColor = 'black',
    printScaleDownPercent = 0,
    printTopPaddingPx = 0,
    printBottomPaddingPx = 0,
    printLeftPaddingPx = 0,
    printRightPaddingPx = 0,
  } = payload;

  const fillColorHex = printFillColor === 'white' ? '#ffffff' : '#000000';
  const scaleDown = Math.max(0, Math.min(35, Number(printScaleDownPercent) || 0));
  const topPad = Math.max(0, Math.min(300, Number(printTopPaddingPx) || 0));
  const bottomPad = Math.max(0, Math.min(300, Number(printBottomPaddingPx) || 0));
  const leftPad = Math.max(0, Math.min(300, Number(printLeftPaddingPx) || 0));
  const rightPad = Math.max(0, Math.min(300, Number(printRightPaddingPx) || 0));

  const match = /^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/.exec(String(imageBase64 || ''));
  const ext = match && match[1] === 'png' ? 'png' : 'jpg';
  const bytes = Buffer.from(
    match ? match[2] : String(imageBase64 || '').replace(/^data:image\/\w+;base64,/, ''),
    'base64'
  );

  let printDir = null;
  let printWindow = null;
  let timer = null;

  try {
    let resolvedDeviceName = printerName || undefined;
    if (resolvedDeviceName && mainWindow) {
      const available = await mainWindow.webContents.getPrintersAsync();
      if (!available.some((p) => p.name === resolvedDeviceName)) {
        console.warn(`[Print] Printer "${resolvedDeviceName}" not found in OS, falling back to default printer.`);
        resolvedDeviceName = undefined;
      }
    }

    printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
    });

    printDir = fs.mkdtempSync(path.join(os.tmpdir(), 'digilians-print-'));
    const photoFileName = `photo.${ext}`;
    fs.writeFileSync(path.join(printDir, photoFileName), bytes);

    const html = `<!doctype html><html><head><style>@page{size:100mm 150mm;margin:0}html,body{width:100vw;height:100vh;margin:0;padding:0;overflow:hidden;background:${fillColorHex};display:flex;align-items:center;justify-content:center}canvas{display:block;width:100%;height:100%;max-width:100vw;max-height:100vh;object-fit:contain}img{display:none}</style></head><body><canvas width="1200" height="1800"></canvas><img src="${photoFileName}"></body></html>`;
    const htmlPath = path.join(printDir, 'print.html');
    fs.writeFileSync(htmlPath, html, 'utf8');

    await printWindow.loadFile(htmlPath);
    await printWindow.webContents.executeJavaScript(`
      document.images[0].decode().then(() => {
        const image = document.images[0];
        const canvas = document.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '${fillColorHex}';
        ctx.fillRect(0, 0, 1200, 1800);
        const scaleFactor = Math.max(0.5, Math.min(1, (100 - ${scaleDown}) / 100));
        const availWidth = Math.max(100, 1200 - ${leftPad} - ${rightPad});
        const availHeight = Math.max(100, 1800 - ${topPad} - ${bottomPad});
        const drawWidth = Math.round(availWidth * scaleFactor);
        const drawHeight = Math.round(availHeight * scaleFactor);
        const drawX = ${leftPad} + Math.round((availWidth - drawWidth) / 2);
        const drawY = ${topPad} + Math.round((availHeight - drawHeight) / 2);
        ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      });
    `);

    await new Promise((resolve, reject) => {
      timer = setTimeout(
        () => reject(new Error('Printer did not respond within 45s. Check the printer queue.')),
        45000
      );
      printWindow.webContents.print(
        {
          silent: true,
          printBackground: true,
          deviceName: resolvedDeviceName,
          margins: { marginType: 'none' },
          pageSize: { width: 100000, height: 150000 }, // 100x150mm (SELPHY Postcard)
          landscape: false,
          copies: Math.max(1, Math.min(10, Number(copies) || 1)),
        },
        (ok, reason) => (ok ? resolve() : reject(new Error(reason || 'Printing failed.')))
      );
    });

    return { success: true };
  } catch (err) {
    return { success: false, error: err?.message || 'Print failed' };
  } finally {
    if (timer) clearTimeout(timer);
    if (printWindow && !printWindow.isDestroyed()) {
      printWindow.destroy();
    }
    if (printDir) {
      try {
        fs.rmSync(printDir, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
  }
});

ipcMain.handle('clear-printer-queue', async (event, printerName) => {
  if (process.platform !== 'win32') return { success: true };
  const { execFile } = require('child_process');
  const safeName = printerName ? String(printerName).replace(/'/g, "''") : '';
  const cmd = safeName
    ? `Get-PrintJob -PrinterName '${safeName}' -ErrorAction SilentlyContinue | Remove-PrintJob -ErrorAction SilentlyContinue`
    : `Get-Printer | ForEach-Object { Get-PrintJob -PrinterName $_.Name -ErrorAction SilentlyContinue | Remove-PrintJob -ErrorAction SilentlyContinue }`;
  return new Promise((resolve) => {
    execFile('powershell.exe', ['-NoProfile', '-Command', cmd], (err) => {
      if (err) resolve({ success: false, error: err.message });
      else resolve({ success: true });
    });
  });
});

ipcMain.handle('upload-to-cloudinary', async (event, { imageBase64, cloudName, apiKey, apiSecret, folder, fullPrompt, era }) => {
  try {
    if (!cloudName || !apiKey || !apiSecret || !folder) {
      return { success: false, error: 'Missing Cloudinary cloudConfig credentials' };
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const context = buildCloudinaryContextString(fullPrompt, era ? { era } : undefined);

    const paramsToSign = { folder, tags: folder, timestamp };
    if (context) paramsToSign.context = context;

    const sortedString = Object.keys(paramsToSign)
      .sort()
      .map((k) => `${k}=${paramsToSign[k]}`)
      .join('&');

    const signature = crypto
      .createHash('sha1')
      .update(`${sortedString}${apiSecret}`)
      .digest('hex');

    const formData = new FormData();
    formData.append('file', imageBase64);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', folder);
    formData.append('tags', folder);
    if (context) formData.append('context', context);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Cloudinary HTTP ${res.status}: ${errText}` };
    }

    const data = await res.json();
    return { success: true, secureUrl: data.secure_url, publicId: data.public_id };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
