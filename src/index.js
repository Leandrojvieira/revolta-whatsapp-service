const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const {
  startWhatsApp,
  getQR,
  getStatus
} = require('./whatsapp');

const app = express();
app.use(cors());
app.use(express.json());

// Inicia WhatsApp automaticamente
startWhatsApp();

/**
 * STATUS
 */
app.get('/whatsapp/status', (req, res) => {
  res.json({ status: getStatus() });
});

/**
 * GERAR QR CODE
 */
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
