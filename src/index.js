import express from 'express';
import cors from 'cors';
import {
  initWhatsApp,
  generatePairingCode,
  getStatus
} from './whatsapp.js';

const app = express();

app.use(cors());
app.use(express.json());

initWhatsApp();

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.get('/status', (_, res) => {
  res.json(getStatus());
});

app.post('/pairing-code', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Telefone obrigatório' });
    }

    const code = await generatePairingCode(phone);

    res.json({ code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao gerar código' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp Service rodando na porta ${PORT}`);
});
