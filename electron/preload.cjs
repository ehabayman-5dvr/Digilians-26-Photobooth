const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  onToggleAdmin: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('toggle-admin', handler);
    return () => ipcRenderer.removeListener('toggle-admin', handler);
  },
  getOperatorSettings: () => ipcRenderer.invoke('get-operator-settings'),
  saveOperatorSettings: (settings) => ipcRenderer.invoke('save-operator-settings', settings),
  getCloudConfigCache: () => ipcRenderer.invoke('get-cloud-config-cache'),
  saveCloudConfigCache: (config) => ipcRenderer.invoke('save-cloud-config-cache', config),
  exitKiosk: () => ipcRenderer.invoke('exit-kiosk'),
  enterKiosk: () => ipcRenderer.invoke('enter-kiosk'),
  relaunchApp: () => ipcRenderer.invoke('relaunch-app'),
  pickTestImage: () => ipcRenderer.invoke('pick-test-image'),
  saveLocalPhoto: (payload) => ipcRenderer.invoke('save-local-photo', payload),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printPhoto: (payload) => ipcRenderer.invoke('print-photo', payload),
  clearPrinterQueue: (printerName) => ipcRenderer.invoke('clear-printer-queue', printerName),
  uploadToCloudinary: (payload) => ipcRenderer.invoke('upload-to-cloudinary', payload),
});
