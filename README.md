# 🚀 ClippAI Backend Pro (com ytdl-core)

Backend com download via ytdl-core (compatível com Render, Railway, Heroku e local).

## ✅ Como rodar:

1. Instale dependências:
```bash
npm install
```

2. Crie o arquivo .env:
```
REPLICATE_API_TOKEN=SEU_TOKEN
REPLICATE_MODEL_TRANSCRIBE=guillaumekln/whisper:latest
REPLICATE_MODEL_HIGHLIGHT=yet-another-ai/video-highlights-detection
REPLICATE_MODEL_THUMBNAIL=stability-ai/stable-diffusion
REPLICATE_MODEL_UPSCALE=xinntao/realsr
PORT=10000
```

3. Rode o servidor:
```bash
npm start
```
ou
```bash
node index.js
```