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

/**
 * Utilitário: Gera timestamp formatado no padrão YYYY-MM-DD_HHmmss para nomes de arquivo
 */
function gerarTimestampArquivo() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    const segundos = String(agora.getSeconds()).padStart(2, '0');
    return `${ano}-${mes}-${dia}_${horas}${minutos}${segundos}`;
}

/**
 * Utilitário: Consulta projetos aplicando filtros de status, busca, ordenação ou lista explícita de IDs
 */
async function buscarProjetosParaExportacao(query) {
    const { status, busca, ordem, ids } = query;

    // Se uma lista de IDs foi enviada (ordem personalizada do usuário via Drag-and-Drop)
    if (ids && ids.trim()) {
        const idList = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        if (idList.length > 0) {
            const projetos = await prisma.projeto.findMany({
                where: { id: { in: idList } }
            });
            // Preserva a ordem exata da lista de IDs enviada pelo cliente
            const mapa = new Map(projetos.map(p => [p.id, p]));
            return idList.map(id => mapa.get(id)).filter(Boolean);
        }
    }

    const where = {};
    if (status && status !== 'todos') {
        where.status = status;
    }

    if (busca && busca.trim()) {
        const termo = busca.trim();
        where.OR = [
            { nome: { contains: termo, mode: 'insensitive' } },
            { descricao: { contains: termo, mode: 'insensitive' } }
        ];
    }

    let orderBy = { createdAt: 'desc' };
    if (ordem === 'antigos') {
        orderBy = { createdAt: 'asc' };
    } else if (ordem === 'az') {
        orderBy = { nome: 'asc' };
    } else if (ordem === 'za') {
        orderBy = { nome: 'desc' };
    }

    return await prisma.projeto.findMany({
        where,
        orderBy
    });
}

// Exporta projetos em formato CSV via fluxo HTTP direto (Server-side Streaming para Mobile e Desktop)
exports.exportarCsv = async (req, res) => {
    try {
        const projetos = await buscarProjetosParaExportacao(req.query);

        const cabecalhos = ['ID', 'Nome do Projeto', 'Descrição', 'Status', 'Data de Criação'];
        const linhas = projetos.map(p => {
            const id = p.id;
            const nome = `"${(p.nome || '').replace(/"/g, '""')}"`;
            const descricao = `"${(p.descricao || '').replace(/"/g, '""')}"`;
            const status = `"${(p.status || '').replace(/"/g, '""')}"`;
            const dataCriacao = p.createdAt ? new Date(p.createdAt) : new Date();
            const dataFormatada = `"${dataCriacao.toLocaleDateString('pt-BR')} ${dataCriacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}"`;
            return [id, nome, descricao, status, dataFormatada].join(';');
        });

        // Padrão Excel PT-BR com delimitador ';' e UTF-8 BOM para evitar problemas com acentos
        const conteudoCsv = '\uFEFF' + [cabecalhos.join(';'), ...linhas].join('\r\n');
        const filename = `projetos_${gerarTimestampArquivo()}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.send(conteudoCsv);
    } catch (error) {
        console.error("Erro ao exportar CSV:", error);
        res.status(500).json({ erro: "Erro ao gerar arquivo CSV de exportação." });
    }
};

// Exporta projetos em formato JSON via fluxo HTTP direto (Server-side Streaming para Mobile e Desktop)
exports.exportarJson = async (req, res) => {
    try {
        const projetos = await buscarProjetosParaExportacao(req.query);

        const dadosExportar = projetos.map(p => {
            const dataCriacao = p.createdAt ? new Date(p.createdAt) : new Date();
            return {
                id: p.id,
                nome: p.nome,
                descricao: p.descricao || '',
                status: p.status,
                createdAt: p.createdAt,
                dataCriacaoFormatada: `${dataCriacao.toLocaleDateString('pt-BR')} ${dataCriacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
            };
        });

        const conteudoJson = JSON.stringify(dadosExportar, null, 2);
        const filename = `projetos_${gerarTimestampArquivo()}.json`;

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.send(conteudoJson);
    } catch (error) {
        console.error("Erro ao exportar JSON:", error);
        res.status(500).json({ erro: "Erro ao gerar arquivo JSON de exportação." });
    }
};


