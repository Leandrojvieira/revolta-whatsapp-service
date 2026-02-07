import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import fs from 'fs';

let sock = null;
let pairingInProgress = false;

export async function startPairing(phoneNumber) {
  if (pairingInProgress) {
    throw new Error('Pairing já em andamento');
  }

  pairingInProgress = true;

  const authPath = './data/auth';
  if (!fs.existsSync(authPath)) {
    fs.mkdirSync(authPath, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ['ReVolta', 'Chrome', '1.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  const code = await sock.requestPairingCode(phoneNumber);

  pairingInProgress = false;
  return code;
}
