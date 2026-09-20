const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Lista projetos ordenados pelos mais recentes
exports.listar = async (req, res) => {
    try {
        const projetos = await prisma.projeto.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(projetos);
    } catch (error) {
        console.error("Erro ao listar projetos:", error);
        res.status(500).json({ erro: "Erro interno ao buscar projetos no banco de dados." });
    }
};

// Cria um novo projeto validando campos obrigatórios
exports.criar = async (req, res) => {
    const { nome, descricao } = req.body;

    if (!nome || nome.trim() === '') {
        return res.status(400).json({ erro: "Atenção: O nome do projeto é obrigatório." });
    }

    try {
        const novoProjeto = await prisma.projeto.create({
            data: { 
                nome: nome.trim(), 
                descricao: descricao ? descricao.trim() : null 
            }
        });
        res.status(201).json(novoProjeto);
    } catch (error) {
        console.error("Erro ao criar projeto:", error);
        res.status(500).json({ erro: "Erro interno ao criar o projeto." });
    }
};

// Exclui um projeto existente
exports.deletar = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.projeto.delete({
            where: { id: parseInt(id) }
        });
        res.json({ mensagem: "Projeto deletado com sucesso!" });
    } catch (error) {
        console.error("Erro ao deletar projeto:", error);
        res.status(500).json({ erro: "Erro ao deletar projeto. Verifique se ele existe." });
    }
};
