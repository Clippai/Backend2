import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Teste API
app.get('/', (req, res) => {
  res.send('API funcionando!');
});

// Endpoint para processar vídeo
app.post('/api/processar-video', async (req, res) => {
  const { link, userId } = req.body;

  if (!link) {
    return res.status(400).json({ error: 'Link do vídeo é obrigatório.' });
  }

  const videoId = uuidv4();
  const outputPath = `${videoId}.mp4`;

  exec(`yt-dlp -o "${outputPath}" "${link}"`, async (error) => {
    if (error) {
      console.error('Erro ao baixar vídeo:', error);
      return res.status(500).json({ error: 'Erro ao baixar vídeo.' });
    }

    try {
      const highlight = await axios.post(
        'https://api.replicate.com/v1/predictions',
        {
          version: process.env.REPLICATE_MODEL_HIGHLIGHT,
          input: { video: outputPath },
        },
        {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      res.json({
        message: 'Processamento concluído!',
        videoOriginal: link,
        corte: highlight.data,
      });

    } catch (err) {
      console.error('Erro ao processar IA:', err);
      return res.status(500).json({ error: 'Erro no processamento IA.' });
    }
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
