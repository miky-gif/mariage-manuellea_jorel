/*
 * Genere le QR code de partage du site (public/assets/qr.png).
 * Usage : npm run qr -- https://adresse-du-site.com
 * Necessite le paquet "qrcode" (installe automatiquement via npm install).
 */
const path = require('path');
const fs = require('fs');

const url = process.argv[2];
if (!url) {
  console.error('Usage : npm run qr -- https://adresse-du-site.com');
  process.exit(1);
}

let QRCode;
try { QRCode = require('qrcode'); }
catch (_) {
  console.error('Le paquet "qrcode" est introuvable. Lancez d\'abord : npm install');
  process.exit(1);
}

const out = path.join(__dirname, '..', 'public', 'assets', 'qr.png');
QRCode.toFile(out, url, {
  width: 600,
  margin: 1,
  color: { dark: '#7A4040', light: '#FDF6F0' },
}, function (err) {
  if (err) { console.error(err); process.exit(1); }
  console.log('QR code genere : ' + out + '  ->  ' + url);
  console.log('Il s\'affichera automatiquement dans le pied de page.');
});
