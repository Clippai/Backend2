import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { exec } from 'child_process';

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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});