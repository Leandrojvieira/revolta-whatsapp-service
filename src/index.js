import express from 'express'
import cors from 'cors'
import { initWhatsApp, getQR, getStatus } from './whatsapp.js'

const app = express()
app.use(cors())
app.use(express.json())

initWhatsApp()

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/whatsapp/status', (req, res) => {
  res.json(getStatus())
})

app.get('/whatsapp/qr', (req, res) => {
  const qr = getQR()
  if (!qr) {
    return res.status(404).json({ message: 'QR não disponível' })
  }
  res.json({ qr })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp Service rodando na porta ${PORT}`)
})
