import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'

let sock = null
let lastConnection = { connected: false }

const AUTH_DIR = '/app/data/auth'

export async function initWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: ['Chrome', 'Desktop', '1.0.0']
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update

    if (connection === 'open') {
      lastConnection.connected = true
      console.log('✅ WhatsApp conectado')
    }

    if (connection === 'close') {
      lastConnection.connected = false
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

      console.log('❌ Conexão fechada. Reconnect:', shouldReconnect)

      if (shouldReconnect) {
        initWhatsApp()
      }
    }
  })

  sock.ev.on('creds.update', saveCreds)
}

export async function getPairingCode(phone) {
  if (!sock) throw new Error('WhatsApp não inicializado')

  const cleanPhone = phone.replace(/\D/g, '')
  const code = await sock.requestPairingCode(cleanPhone)
  return code
}

export function getStatus() {
  return { connected: lastConnection.connected }
}
