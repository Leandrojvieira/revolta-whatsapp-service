import express from 'express';
import cors from 'cors';
import qrcode from 'qrcode';
import { startWhatsApp, getQR, getStatus } from './whatsapp.js';

const app = express();
app.use(cors());
app.use(express.json());

startWhatsApp();

app.get('/whatsapp/status', (req, res) => {
  res.json({ status: getStatus() });
});

app.get('/whatsapp/qr', async (req, res) => {
  const qr = getQR();
  if (!qr) {
    return res.status(404).json({ detail: 'QR não disponível' });
  }
  const qrImage = await qrcode.toDataURL(qr);
  res.json({ qr: qrImage });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp Service rodando na porta ${PORT}`);
});
