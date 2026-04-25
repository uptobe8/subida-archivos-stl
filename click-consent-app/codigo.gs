const SHEET_ID = 'PEGA_AQUI_EL_ID_DE_TU_HOJA';
const SHEET_NAME = 'Consentimientos';

const LEGAL_VERSION = 'v1.0';
const MARKETING_VERSION = 'v1.0';

function doGet(e) {
  const page = (e && e.parameter && e.parameter.page ? String(e.parameter.page) : '').toLowerCase();
  const routes = {
    '': 'index',
    index: 'index',
    terminos: 'terminos',
    privacidad: 'privacidad',
    avisolegal: 'aviso-legal',
    cookies: 'cookies',
    condicionesuso: 'condiciones-uso',
    contratacion: 'contratacion',
    desistimiento: 'desistimiento',
    comunicaciones: 'comunicaciones',
    baja: 'baja',
    'politica-privacidad': 'politica-privacidad'
  };

  const view = routes[page] || 'index';
  return HtmlService.createHtmlOutputFromFile(view)
    .setTitle('Click & Consent App')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function setupSheet() {
  const sh = setupSheet_();
  return `OK: ${sh.getName()}`;
}

function setupSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);

  const headers = [
    'EVENTO','TIMESTAMP_UTC','NOMBRE','EMAIL','TELEFONO',
    'LEGAL_OK','LEGAL_VERSION','LEGAL_HASH',
    'MARKETING_OK','MARKETING_VERSION','MARKETING_HASH',
    'MOTIVO_BAJA','IP','USER_AGENT','DEVICE','BROWSER','OS'
  ];

  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.setFrozenRows(1);
  } else {
    const current = sh.getRange(1, 1, 1, headers.length).getValues()[0];
    const mismatch = headers.some((h, i) => current[i] !== h);
    if (mismatch) {
      sh.clear();
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
      sh.setFrozenRows(1);
    }
  }
  return sh;
}

function submitConsent(data) {
  const sh = getSheet_();
  const d = data || {};

  const legalOk = !!d.legalOk;
  const marketingOk = !!d.marketingOk;
  if (!legalOk) throw new Error('Debes aceptar los textos legales.');

  const name = clean_(d.name);
  const email = clean_(d.email);
  const phone = clean_(d.phone);
  if (!name || !email || !phone) throw new Error('Nombre, email y teléfono son obligatorios.');

  const ua = clean_(d.userAgent);
  const row = [
    'ALTA',
    toUtcString_(new Date()),
    name,
    email,
    phone,
    true,
    LEGAL_VERSION,
    getLegalHash_(),
    marketingOk,
    MARKETING_VERSION,
    getMarketingHash_(),
    '',
    clean_(d.ip),
    ua,
    parseDeviceType_(ua),
    parseBrowser_(ua),
    parseOS_(ua)
  ];

  sh.appendRow(row);
  return { ok: true, message: 'Consentimiento registrado correctamente.' };
}

function revokeConsent(data) {
  const sh = getSheet_();
  const d = data || {};

  const email = clean_(d.email);
  const phone = clean_(d.phone);
  const reason = clean_(d.reason);
  if (!email && !phone) throw new Error('Debes indicar email o teléfono.');

  const ua = clean_(d.userAgent);
  const row = [
    'BAJA',
    toUtcString_(new Date()),
    '',
    email,
    phone,
    false,
    LEGAL_VERSION,
    getLegalHash_(),
    false,
    MARKETING_VERSION,
    getMarketingHash_(),
    reason,
    clean_(d.ip),
    ua,
    parseDeviceType_(ua),
    parseBrowser_(ua),
    parseOS_(ua)
  ];

  sh.appendRow(row);
  return { ok: true, message: 'Baja registrada correctamente.' };
}

function getSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = setupSheet_();
  return sh;
}

function getBaseUrl_() {
  return ScriptApp.getService().getUrl();
}

function getLegalHash_() {
  const text = `LEGAL|${LEGAL_VERSION}|Click&Consent`;
  return bytesToHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text));
}

function getMarketingHash_() {
  const text = `MARKETING|${MARKETING_VERSION}|Click&Consent`;
  return bytesToHex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text));
}

function toUtcString_(date) {
  return Utilities.formatDate(date, 'UTC', "yyyy-MM-dd'T'HH:mm:ss'Z'");
}

function bytesToHex_(bytes) {
  return bytes.map(b => (b + 256).toString(16).slice(-2)).join('');
}

function parseDeviceType_(ua) {
  const s = (ua || '').toLowerCase();
  if (/iphone|android.*mobile|windows phone/.test(s)) return 'MOBILE';
  if (/ipad|tablet|android/.test(s)) return 'TABLET';
  return 'DESKTOP';
}

function parseBrowser_(ua) {
  const s = (ua || '').toLowerCase();
  if (s.includes('edg/')) return 'Edge';
  if (s.includes('chrome/')) return 'Chrome';
  if (s.includes('safari/') && !s.includes('chrome/')) return 'Safari';
  if (s.includes('firefox/')) return 'Firefox';
  return 'Other';
}

function parseOS_(ua) {
  const s = (ua || '').toLowerCase();
  if (s.includes('windows')) return 'Windows';
  if (s.includes('mac os')) return 'macOS';
  if (s.includes('android')) return 'Android';
  if (s.includes('iphone') || s.includes('ipad') || s.includes('ios')) return 'iOS';
  if (s.includes('linux')) return 'Linux';
  return 'Other';
}

function clean_(value) {
  return String(value || '').trim();
}
