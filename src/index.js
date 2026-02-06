import express from 'express'
import cors from 'cors'
import routes from './routes.js'
import { startWhatsApp } from './whatsapp.js'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/whatsapp', routes)

const PORT = process.env.PORT || 3001

app.listen(PORT, async () => {
  console.log(`🚀 WhatsApp Service rodando na porta ${PORT}`)
  await startWhatsApp()
})
