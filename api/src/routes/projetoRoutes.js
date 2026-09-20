const express = require('express');
const router = express.Router();
const projetoController = require('../controllers/projetoController');

// Lista todos os projetos
router.get('/', projetoController.listar);

// Cria um novo projeto
router.post('/', projetoController.criar);

// Atualiza o status de um projeto (PATCH)
router.patch('/:id/status', projetoController.atualizarStatus);

// Deleta um projeto pelo ID
router.delete('/:id', projetoController.deletar);

module.exports = router;
