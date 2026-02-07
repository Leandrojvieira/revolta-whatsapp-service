import express from 'express'
import cors from 'cors'
import { initWhatsApp, getPairingCode, getStatus } from './whatsapp.js'

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

app.post('/whatsapp/pair', async (req, res) => {
  const { phone } = req.body
  if (!phone) return res.status(400).json({ error: 'Telefone obrigatório' })

  try {
    const code = await getPairingCode(phone)
    res.json({ code })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp Service rodando na porta ${PORT}`)
})
