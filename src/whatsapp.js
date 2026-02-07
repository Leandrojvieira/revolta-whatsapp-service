import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState
} from '@whiskeysockets/baileys'

import fs from 'fs'

let sock = null
let qrCode = null
let isConnected = false
let initializing = false

const AUTH_PATH = '/app/data/baileys-auth'

export async function initWhatsApp() {
  if (initializing || sock) return
  initializing = true

  if (!fs.existsSync(AUTH_PATH)) {
    fs.mkdirSync(AUTH_PATH, { recursive: true })
  }

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_PATH)

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      qrCode = qr
      console.log('📱 QR gerado')
    }

    if (connection === 'open') {
      isConnected = true
      qrCode = null
      console.log('✅ WhatsApp conectado')
    }

    if (connection === 'close') {
      isConnected = false
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

      console.log('❌ Conexão fechada. Reconnect:', shouldReconnect)

      sock = null
      initializing = false

      if (shouldReconnect) {
        setTimeout(initWhatsApp, 3000)
      }
    }
  })

  sock.ev.on('creds.update', saveCreds)
}

export function getQR() {
  return qrCode
}

export function getStatus() {
  return {
    connected: isConnected,
    hasQR: !!qrCode
  }
}
