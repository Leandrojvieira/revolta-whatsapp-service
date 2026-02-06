import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';

let sock = null;
let qrCode = null;

export async function initWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      qrCode = qr;
      console.log('📸 QR Code gerado');
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('❌ Conexão fechada. Reconnect:', shouldReconnect);
      if (shouldReconnect) initWhatsApp();
    }

    if (connection === 'open') {
      console.log('✅ WhatsApp conectado');
      qrCode = null;
    }
  });
}

export function getQR() {
  return qrCode;
}
