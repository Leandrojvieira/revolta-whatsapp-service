import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason
} from '@whiskeysockets/baileys'
import qrcode from 'qrcode'

let sock
let qrCode = null
let isConnected = false

export async function startWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('./src/store/auth_info')

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr, lastDisconnect } = update

    if (qr) {
      qrCode = await qrcode.toDataURL(qr)
      isConnected = false
      console.log('[WA] QR Code gerado')
    }

    if (connection === 'open') {
      qrCode = null
      isConnected = true
      console.log('[WA] WhatsApp conectado')
    }

    if (connection === 'close') {
      isConnected = false
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut

      if (shouldReconnect) startWhatsApp()
    }
  })
}

export function getStatus() {
  return { connected: isConnected, qr: qrCode }
}

export async function sendMessage(number, message) {
  if (!sock || !isConnected) throw new Error('WhatsApp não conectado')

  const jid = number.includes('@s.whatsapp.net')
    ? number
    : `${number}@s.whatsapp.net`

  await sock.sendMessage(jid, { text: message })
}
