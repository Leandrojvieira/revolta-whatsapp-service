import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import Pino from 'pino';

let sock = null;
let currentQR = null;
let connected = false;

export async function initWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('/data/auth');

  sock = makeWASocket({
    logger: Pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, qr } = update;

    if (qr) {
      console.log('📱 QR gerado');
      currentQR = qr;
      connected = false;
    }

    if (connection === 'open') {
      console.log('✅ WhatsApp conectado');
      currentQR = null;
      connected = true;
    }

    if (connection === 'close') {
      connected = false;
      const shouldReconnect =
        update.lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      console.log('❌ Conexão fechada. Reconnect:', shouldReconnect);

      if (shouldReconnect) {
        initWhatsApp();
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

export function getQR() {
  return currentQR;
}

export function getStatus() {
  return {
    connected,
    hasQR: !!currentQR,
  };
}
