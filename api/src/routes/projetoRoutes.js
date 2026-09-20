const express = require('express');
const router = express.Router();
const projetoController = require('../controllers/projetoController');

// Exportação de relatórios (rotas específicas antes de rotas com parâmetros)
router.get('/export/csv', projetoController.exportarCsv);
router.get('/export/json', projetoController.exportarJson);

// Lista todos os projetos
router.get('/', projetoController.listar);

// Cria um novo projeto
router.post('/', projetoController.criar);

// Atualiza o status de um projeto (PATCH)
router.patch('/:id/status', projetoController.atualizarStatus);

// Atualiza dados de um projeto existente (PUT - Nome e Descrição)
router.put('/:id', projetoController.atualizar);

// Deleta um projeto pelo ID
router.delete('/:id', projetoController.deletar);

module.exports = router;
