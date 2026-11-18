import { Language } from '../types/photobooth';

export interface UIStrings {
  eventClosedTitle: string;
  eventLimitTitle: string;
  choosePathEyebrow: string;
  choosePathTitle: string;
  swipeHint: string;
  continueBtn: string;
  prevPathLabel: string;
  nextPathLabel: string;
  backBtn: string;
  takePhotoLabel: string;
  uploadTestPhoto: string;
  reviewTitle: string;
  reviewHintOpen: (sec: number) => string;
  reviewHintClosed: string;
  retakeBtn: string;
  retakeClosedBtn: string;
  generatingLabel: string;
  doneLabel: string;
  stepProgress: (step: number, total: number) => string;
  resultTitle: string;
  scanToDownload: string;
  scanSub: string;
  qrLoading: string;
  qrUnavailable: string;
  qrRetry: string;
  printBtn: string;
  printingBtn: string;
  printedBtn: string;
  tryAnotherPath: string;
  finishBtn: string;
  genErrorTitle: string;
  retryBtn: string;
}

const EN: UIStrings = {
  eventClosedTitle: 'This event has finished.',
  eventLimitTitle: 'Portrait limit reached.',
  choosePathEyebrow: 'FIVE PATHS TO THE FUTURE',
  choosePathTitle: 'Choose your path',
  swipeHint: 'Swipe to explore the paths',
  continueBtn: 'Continue',
  prevPathLabel: 'Previous path',
  nextPathLabel: 'Next path',
  backBtn: 'Back',
  takePhotoLabel: 'Take photo',
  uploadTestPhoto: 'Upload Test Photo',
  reviewTitle: 'Happy with your photo?',
  reviewHintOpen: (sec) => `You can retake within ${sec} seconds`,
  reviewHintClosed: 'Moving on to create your photo…',
  retakeBtn: 'Retake',
  retakeClosedBtn: 'Retake closed',
  generatingLabel: 'Generating',
  doneLabel: 'Done',
  stepProgress: (step, total) => `STEP ${step} / ${total}`,
  resultTitle: 'Your photo is ready!',
  scanToDownload: 'Scan to download',
  scanSub: 'Point your phone camera at the code',
  qrLoading: 'Preparing QR code…',
  qrUnavailable: 'QR upload unavailable',
  qrRetry: 'Retry Upload',
  printBtn: 'Print',
  printingBtn: 'Printing…',
  printedBtn: 'Sent to Printer',
  tryAnotherPath: 'Try another path',
  finishBtn: 'Done',
  genErrorTitle: 'Could not generate portrait',
  retryBtn: 'Retry or Retake',
};

const AR: UIStrings = {
  eventClosedTitle: 'انتهت فعالية هذا الحدث.',
  eventLimitTitle: 'تم الوصول إلى الحد الأقصى للصور.',
  choosePathEyebrow: 'خمسة مسارات للمستقبل',
  choosePathTitle: 'اختر مسارك',
  swipeHint: 'اسحب لاستكشاف المسارات',
  continueBtn: 'متابعة',
  prevPathLabel: 'المسار السابق',
  nextPathLabel: 'المسار التالي',
  backBtn: 'رجوع',
  takePhotoLabel: 'التقط الصورة',
  uploadTestPhoto: 'رفع صورة تجريبية',
  reviewTitle: 'هل أعجبتك الصورة؟',
  reviewHintOpen: (sec) => `يمكنك إعادة الالتقاط خلال ${toLocaleDigits(sec, 'ar')} ثوانٍ`,
  reviewHintClosed: 'ننتقل الآن لإنشاء صورتك…',
  retakeBtn: 'إعادة',
  retakeClosedBtn: 'انتهى وقت الإعادة',
  generatingLabel: 'جارٍ الإنشاء',
  doneLabel: 'اكتمل',
  stepProgress: (step, total) => `الخطوة ${step} من ${total}`,
  resultTitle: 'صورتك جاهزة!',
  scanToDownload: 'امسح للتحميل',
  scanSub: 'وجّه كاميرا هاتفك نحو الرمز',
  qrLoading: 'جاري تجهيز رمز QR…',
  qrUnavailable: 'تعذر رفع الصورة للرمز',
  qrRetry: 'إعادة المحاولة',
  printBtn: 'طباعة',
  printingBtn: 'جاري الطباعة…',
  printedBtn: 'تم إرسال الطباعة',
  tryAnotherPath: 'جرّب مساراً آخر',
  finishBtn: 'إنهاء',
  genErrorTitle: 'تعذر إنشاء الصورة',
  retryBtn: 'إعادة المحاولة أو التصوير',
};

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toLocaleDigits(value: number | string, lang: Language, padZero = 0): string {
  const str = padZero > 0 ? String(value).padStart(padZero, '0') : String(value);
  if (lang !== 'ar') return str;
  return str.replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]);
}

export function getStrings(lang: Language): UIStrings {
  return lang === 'ar' ? AR : EN;
}
