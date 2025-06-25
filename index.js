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

let db = JSON.parse(fs.readFileSync('./db.json'));

function salvarDB() {
  fs.writeFileSync('./db.json', JSON.stringify(db, null, 2));
}

app.get('/', (req, res) => {
  res.send('🚀 API ClippAI completa rodando!');
});

app.post('/cadastrar', (req, res) => {
  const { email, senha } = req.body;
  if (db.usuarios.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email já cadastrado.' });
  }
  const novoUsuario = {
    id: uuidv4(),
    email,
    senha,
    cortesRestantes: 40,
    cortes: []
  };
  db.usuarios.push(novoUsuario);
  salvarDB();
  res.json({ message: 'Usuário cadastrado com sucesso!', user: novoUsuario });
});

app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  const user = db.usuarios.find(u => u.email === email && u.senha === senha);
  if (!user) {
    return res.status(400).json({ error: 'Email ou senha incorretos.' });
  }
  res.json({ message: 'Login bem-sucedido!', user });
});

app.get('/usuario/:id', (req, res) => {
  const user = db.usuarios.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }
  res.json(user);
});

app.post('/enviar-video', async (req, res) => {
  const { link, userId } = req.body;
  const user = db.usuarios.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  if (user.cortesRestantes <= 0) return res.status(400).json({ error: 'Sem cortes restantes.' });

  const videoId = uuidv4();
  const outputPath = `${tempDir}/${videoId}.mp4`;

  try {
    const videoStream = ytdl(link, { quality: 'highestvideo' });
    const writeStream = fs.createWriteStream(outputPath);
    videoStream.pipe(writeStream);

    writeStream.on('finish', async () => {
      try {
        const highlight = await axios.post(
          'https://api.replicate.com/v1/predictions',
          {
            version: process.env.REPLICATE_MODEL_HIGHLIGHT,
            input: { video: outputPath }
          },
          {
            headers: {
              Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const transcript = await axios.post(
          'https://api.replicate.com/v1/predictions',
          {
            version: process.env.REPLICATE_MODEL_TRANSCRIBE,
            input: { audio: outputPath }
          },
          {
            headers: {
              Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const thumbnail = await axios.post(
          'https://api.replicate.com/v1/predictions',
          {
            version: process.env.REPLICATE_MODEL_THUMBNAIL,
            input: { prompt: 'viral video thumbnail high quality' }
          },
          {
            headers: {
              Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const upscale = await axios.post(
          'https://api.replicate.com/v1/predictions',
          {
            version: process.env.REPLICATE_MODEL_UPSCALE,
            input: { image: thumbnail.data.output[0] }
          },
          {
            headers: {
              Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );

        fs.unlinkSync(outputPath);

        const novoCorte = {
          id: videoId,
          link,
          data: new Date(),
          transcricao: transcript.data.output,
          thumbnail: thumbnail.data.output[0],
          thumbnailUpscaled: upscale.data.output[0]
        };

        user.cortes.push(novoCorte);
        user.cortesRestantes -= 1;
        salvarDB();

        res.json({
          message: 'Processamento completo!',
          corte: novoCorte,
          resultadoIA: highlight.data
        });
      } catch (err) {
        fs.unlinkSync(outputPath);
        res.status(500).json({ error: 'Erro no processamento IA.' });
      }
    });

    writeStream.on('error', () => {
      res.status(500).json({ error: 'Erro ao salvar vídeo.' });
    });
  } catch {
    res.status(500).json({ error: 'Erro ao baixar vídeo.' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});