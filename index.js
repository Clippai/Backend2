import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import fs from 'fs';
import ytdl from 'ytdl-core';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const tempDir = './temp';
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

app.get('/', (req, res) => {
  res.send('🚀 API ClippAI rodando com sucesso!');
});

app.post('/api/processar-video', async (req, res) => {
  const { link, userId } = req.body;
  if (!link || !userId) {
    return res.status(400).json({ error: 'Link e userId são obrigatórios.' });
  }

  const videoId = uuidv4();
  const outputPath = `${tempDir}/${videoId}.mp4`;

  console.log(`⬇️ Baixando vídeo: ${link}`);

  try {
    const videoStream = ytdl(link, { quality: 'highestvideo' });
    const writeStream = fs.createWriteStream(outputPath);

    videoStream.pipe(writeStream);

    writeStream.on('finish', async () => {
      console.log(`✅ Download concluído: ${outputPath}`);

      try {
        const response = await axios.post(
          'https://api.replicate.com/v1/predictions',
          {
            version: process.env.REPLICATE_MODEL_HIGHLIGHT,
            input: {
              video: outputPath,
            },
          },
          {
            headers: {
              Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('✨ Processamento IA concluído');

        fs.unlinkSync(outputPath);
        console.log('🗑️ Arquivo local deletado:', outputPath);

        return res.json({
          message: 'Processamento concluído!',
          videoOriginal: link,
          resultadoIA: response.data,
        });
      } catch (err) {
        console.error('❌ Erro no processamento IA:', err.message);
        return res.status(500).json({ error: 'Erro no processamento da IA.' });
      }
    });

    writeStream.on('error', (err) => {
      console.error('❌ Erro ao salvar o vídeo:', err);
      return res.status(500).json({ error: 'Erro ao salvar o vídeo.' });
    });

  } catch (error) {
    console.error('❌ Erro ao baixar o vídeo:', error.message);
    return res.status(500).json({ error: 'Erro ao baixar o vídeo.' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});