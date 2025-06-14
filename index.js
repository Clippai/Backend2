
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MODEL_TRANSCRIBE = process.env.REPLICATE_MODEL_TRANSCRIBE;
const MODEL_HIGHLIGHT = process.env.REPLICATE_MODEL_HIGHLIGHT;
const MODEL_THUMBNAIL = process.env.REPLICATE_MODEL_THUMBNAIL;
const MODEL_UPSCALE = process.env.REPLICATE_MODEL_UPSCALE;

app.get('/', (req, res) => {
    res.send('API funcionando!');
});

app.post('/api/processar-video', (req, res) => {
    const { link, userId } = req.body;

    if (!link) {
        return res.status(400).json({ error: 'O link do vídeo é obrigatório.' });
    }

    console.log(`Recebido pedido de processamento para o link: ${link} do usuário: ${userId}`);

    res.json({ message: 'Processamento iniciado para o vídeo!', link, userId });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
