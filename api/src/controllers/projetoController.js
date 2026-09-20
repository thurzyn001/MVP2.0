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

    if (nome.trim().length > 100) {
        return res.status(400).json({ erro: "Atenção: O nome do projeto não pode ultrapassar 100 caracteres." });
    }

    if (descricao && descricao.trim().length > 500) {
        return res.status(400).json({ erro: "Atenção: A descrição não pode ultrapassar 500 caracteres." });
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

// Atualiza o status de um projeto (Pendente, Em Andamento, Concluído)
exports.atualizarStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const statusValidos = ['Pendente', 'Em Andamento', 'Concluído'];
    if (!status || !statusValidos.includes(status)) {
        return res.status(400).json({ 
            erro: `Status inválido. Escolha entre: ${statusValidos.join(', ')}` 
        });
    }

    try {
        const projetoAtualizado = await prisma.projeto.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        res.json(projetoAtualizado);
    } catch (error) {
        console.error("Erro ao atualizar status do projeto:", error);
        res.status(500).json({ erro: "Erro ao atualizar status do projeto." });
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

// Atualiza dados de um projeto existente (Nome e Descrição)
exports.atualizar = async (req, res) => {
    const { id } = req.params;
    const { nome, descricao } = req.body;

    if (!nome || nome.trim() === '') {
        return res.status(400).json({ erro: "Atenção: O nome do projeto é obrigatório." });
    }

    if (nome.trim().length > 100) {
        return res.status(400).json({ erro: "Atenção: O nome do projeto não pode ultrapassar 100 caracteres." });
    }

    if (descricao && descricao.trim().length > 500) {
        return res.status(400).json({ erro: "Atenção: A descrição não pode ultrapassar 500 caracteres." });
    }

    try {
        const projetoAtualizado = await prisma.projeto.update({
            where: { id: parseInt(id) },
            data: { 
                nome: nome.trim(), 
                descricao: descricao ? descricao.trim() : null 
            }
        });
        res.json(projetoAtualizado);
    } catch (error) {
        console.error("Erro ao atualizar dados do projeto:", error);
        res.status(500).json({ erro: "Erro ao atualizar projeto. Verifique se ele existe." });
    }
};

