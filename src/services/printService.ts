import { LocalOperatorSettings, PrinterDeviceInfo } from '../types/photobooth';
import { reportPhysicalPrint } from './configService';

export async function getAvailablePrinters(): Promise<PrinterDeviceInfo[]> {
  if (!window.electronAPI?.getPrinters) return [];
  return window.electronAPI.getPrinters();
}

export async function dispatchPhysicalPrint(
  imageBase64: string,
  settings: LocalOperatorSettings,
  isTestPrint = false
): Promise<{ success: boolean; printerUsed?: string; error?: string }> {
  if (!window.electronAPI?.printPhoto) {
    return { success: false, error: 'Printing is only available in the Desktop Electron app.' };
  }

  const copies = Math.max(1, Math.floor(settings.printCopies || 1));
  const systemPrinters = await getAvailablePrinters();

  const priorityList =
    settings.printerNames && settings.printerNames.length > 0
      ? settings.printerNames
      : settings.selectedPrinterName
      ? [settings.selectedPrinterName]
      : [];

  // Ready-first, busy-fallback routing
  const readyPrinters: string[] = [];
  const busyPrinters: string[] = [];

  for (const name of priorityList) {
    const match = systemPrinters.find((p) => p.name === name);
    if (!match) continue;
    if (match.status === 0) {
      readyPrinters.push(name);
    } else {
      busyPrinters.push(name);
    }
  }

  const orderedCandidates = [...readyPrinters, ...busyPrinters];
  const targetPrinter = orderedCandidates[0] || undefined;

  const result = await window.electronAPI.printPhoto({
    imageBase64,
    printerName: targetPrinter,
    copies,
    printFillColor: settings.printFillColor,
    printScaleDownPercent: settings.printScaleDownPercent,
    printTopPaddingPx: settings.printTopPaddingPx,
    printBottomPaddingPx: settings.printBottomPaddingPx,
    printLeftPaddingPx: settings.printLeftPaddingPx,
    printRightPaddingPx: settings.printRightPaddingPx,
  });

  if (result.success) {
    if (!isTestPrint && !settings.previewMode) {
      void reportPhysicalPrint(copies);
    }
    return { success: true, printerUsed: targetPrinter || 'OS Default Printer' };
  }

  return { success: false, error: result.error || 'Print job failed' };
}
