import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from '@whiskeysockets/baileys';

import fs from 'fs';

let sock;
let pairingCode = null;
let isConnected = false;

export async function initWhatsApp() {
  const authDir = '/app/data/auth';

  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(authDir);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ['ReVolta', 'Chrome', '1.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      console.log('✅ WhatsApp conectado');
      isConnected = true;
      pairingCode = null;
    }

    if (connection === 'close') {
      isConnected = false;
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      console.log('❌ Conexão fechada. Reconnect:', shouldReconnect);

      if (shouldReconnect) {
        setTimeout(initWhatsApp, 3000);
      }
    }
  });
}

export async function generatePairingCode(phone) {
  if (!sock) {
    throw new Error('WhatsApp não inicializado');
  }

  const code = await sock.requestPairingCode(phone);
  pairingCode = code;
  return code;
}

export function getStatus() {
  return {
    connected: isConnected,
    hasPairingCode: !!pairingCode
  };
}
