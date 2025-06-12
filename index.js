import express from "express";
import cors from "cors";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const dbPath = "./db.json";

// Inicializa o DB se não existir
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([]));
}

// Retorna todos os cortes
app.get("/cuts", (req, res) => {
  fs.readFile(dbPath, (err, data) => {
    if (err) return res.status(500).json({ error: "Erro ao ler o banco de dados." });
    const cuts = JSON.parse(data);
    res.json(cuts);
  });
});

// Cria um novo usuário
app.post("/criar-usuario", (req, res) => {
  const newUser = {
    id: uuidv4(),
    cortesRestantes: 5,
  };
  res.json(newUser);
});

// Consulta cortes restantes
app.get("/cortes-restantes/:userId", (req, res) => {
  const { userId } = req.params;

  fs.readFile(dbPath, (err, data) => {
    if (err) return res.status(500).json({ error: "Erro ao ler banco de dados." });

    const cuts = JSON.parse(data);
    const userCuts = cuts.filter(c => c.userId === userId);
    const restantes = Math.max(0, 5 - userCuts.length);

    res.json({ cortesRestantes: restantes });
  });
});

// Processar vídeo (mock MVP)
app.post("/api/processar-video", async (req, res) => {
  const { link, userId } = req.body;

  if (!link || !userId) {
    return res.status(400).json({ error: "Link e ID do usuário são obrigatórios." });
  }

  try {
    const data = fs.readFileSync(dbPath);
    const cuts = JSON.parse(data);

    const newCut = {
      id: uuidv4(),
      link,
      userId,
      data: new Date().toISOString(),
    };

    cuts.push(newCut);

    fs.writeFileSync(dbPath, JSON.stringify(cuts, null, 2));

    res.json({ success: true, corte: newCut });
  } catch (error) {
    console.error("Erro ao processar vídeo:", error);
    res.status(500).json({ error: "Erro ao processar vídeo." });
  }
});

app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});