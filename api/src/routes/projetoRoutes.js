const express = require('express');
const router = express.Router();
const projetoController = require('../controllers/projetoController');

// Lista todos os projetos
router.get('/', projetoController.listar);

// Cria um novo projeto
router.post('/', projetoController.criar);

// Deleta um projeto pelo ID
router.delete('/:id', projetoController.deletar);

module.exports = router;
