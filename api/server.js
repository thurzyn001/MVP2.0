require('dotenv').config();
const express = require('express');
const cors = require('cors');
const projetoRoutes = require('./src/routes/projetoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de Teste para o Checkpoint 1
app.get('/api/teste', (req, res) => {
    res.json({ mensagem: "Comunicação com Node.js estabelecida com sucesso!" });
});

// Rotas principais da API (CRUD de Projetos)
app.use('/api/projetos', projetoRoutes);

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});
