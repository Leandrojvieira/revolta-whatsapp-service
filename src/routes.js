import express from 'express'
import { getStatus, sendMessage } from './whatsapp.js'

const router = express.Router()

router.get('/status', (req, res) => {
  res.json(getStatus())
})

router.get('/qr', (req, res) => {
  const status = getStatus()
  if (!status.qr) return res.status(204).end()
  res.json({ qr: status.qr })
})

router.post('/send', async (req, res) => {
  const { number, message } = req.body
  if (!number || !message) {
    return res.status(400).json({ error: 'number e message são obrigatórios' })
  }

  try {
    await sendMessage(number, message)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
