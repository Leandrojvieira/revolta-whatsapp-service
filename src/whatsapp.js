import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from '@whiskeysockets/baileys';

let sock;
let qrCode = null;
let connectionStatus = 'disconnected';

export async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      qrCode = qr;
      connectionStatus = 'qr';
      console.log('📸 QR Code gerado');
    }

    if (connection === 'open') {
      qrCode = null;
      connectionStatus = 'connected';
      console.log('✅ WhatsApp conectado');
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

      connectionStatus = 'disconnected';
      console.log('❌ Conexão fechada. Reconnect:', shouldReconnect);

      if (shouldReconnect) {
        startWhatsApp();
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

export function getQR() {
  return qrCode;
}

export function getStatus() {
  return connectionStatus;
}
