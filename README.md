# 🚀 ClippAI Backend COMPLETO

## Funcionalidades:
- Login e Cadastro
- Contador de Cortes
- Cortes Inteligentes com IA (Replicate)
- Transcrição automática (Whisper)
- Geração de Thumbnail com IA
- Upscale de Thumbnail

## Rodando local:

1. Instale dependências:
```
npm install
```

2. Crie o arquivo `.env`:
```
REPLICATE_API_TOKEN=SEU_TOKEN
REPLICATE_MODEL_HIGHLIGHT=yet-another-ai/video-highlights-detection
REPLICATE_MODEL_TRANSCRIBE=guillaumekln/whisper:latest
REPLICATE_MODEL_THUMBNAIL=stability-ai/stable-diffusion
REPLICATE_MODEL_UPSCALE=xinntao/realsr
PORT=10000
```

3. Inicie o servidor:
```
npm start
```