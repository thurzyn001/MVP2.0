/**
 * main.js - Lógica de Frontend usando Fetch API (Checkpoints 6, 7 e 9)
 */

const API_URL = 'http://localhost:3000/api/projetos';

// Elementos do DOM
const formProjeto = document.getElementById('form-projeto');
const listaProjetos = document.getElementById('lista-projetos');
const alerta = document.getElementById('alerta-sistema');

// Carregar lista de projetos ao inicializar a página
document.addEventListener('DOMContentLoaded', carregarProjetos);

/**
 * Evento: Salvar novo projeto (POST)
 */
formProjeto.addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    const nome = document.getElementById('nome').value;
    const descricao = document.getElementById('descricao').value;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, descricao })
        });

        const data = await response.json();

        // Tratamento de Erros da API (Checkpoint 9)
        if (!response.ok) {
            throw new Error(data.erro || 'Ocorreu um erro desconhecido ao salvar.');
        }

        mostrarAlerta('Projeto cadastrado com sucesso!', 'sucesso');
        formProjeto.reset(); // Limpa os campos
        
        // Recarrega a lista dinamicamente
        carregarProjetos();

    } catch (error) {
        mostrarAlerta(error.message, 'erro');
    }
});

/**
 * Busca os projetos no Backend e atualiza a tela (GET)
 */
async function carregarProjetos() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Falha ao buscar projetos da API');
        }

        const projetos = await response.json();
        renderizarProjetos(projetos);
    } catch (error) {
        listaProjetos.innerHTML = `
            <div class="empty-state" style="color: red;">
                <p>Erro de conexão: Não foi possível carregar os projetos.</p>
                <p><small>Verifique se o backend Node.js está rodando (npm start na pasta api).</small></p>
            </div>
        `;
    }
}

/**
 * Constrói o HTML para cada projeto retornado da API
 */
function renderizarProjetos(projetos) {
    if (projetos.length === 0) {
        listaProjetos.innerHTML = '<div class="empty-state">Nenhum projeto cadastrado ainda. Comece adicionando um acima!</div>';
        return;
    }

    listaProjetos.innerHTML = ''; // Limpa a div de loading
    
    projetos.forEach(projeto => {
        // Formatar data
        const dataFormatada = new Date(projeto.createdAt).toLocaleDateString('pt-BR');
        
        const div = document.createElement('div');
        div.className = 'projeto-item';
        div.innerHTML = `
            <div class="projeto-info">
                <h3>${escaparHTML(projeto.nome)}</h3>
                <p>${escaparHTML(projeto.descricao || 'Nenhuma descrição fornecida.')}</p>
                <div class="projeto-meta">
                    <span class="badge">${escaparHTML(projeto.status)}</span>
                    <small style="color: #64748b; margin-left: 10px;">Criado em: ${dataFormatada}</small>
                </div>
            </div>
            <div class="projeto-acoes">
                <button class="btn btn-danger" onclick="deletarProjeto(${projeto.id})">
                    Excluir
                </button>
            </div>
        `;
        listaProjetos.appendChild(div);
    });
}

/**
 * Deleta um projeto (DELETE)
 */
async function deletarProjeto(id) {
    if (!confirm('Atenção: Tem certeza que deseja excluir permanentemente este projeto?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.erro || 'Erro ao deletar o projeto');
        }

        // Recarrega a lista sem piscar a página (Checkpoint 7)
        mostrarAlerta('Projeto excluído com sucesso.', 'sucesso');
        carregarProjetos();
        
    } catch (error) {
        mostrarAlerta(error.message, 'erro');
    }
}

/**
 * Função utilitária: Exibir alertas bonitos na tela
 */
function mostrarAlerta(mensagem, tipo) {
    alerta.innerHTML = mensagem;
    alerta.className = `alerta ${tipo}`;
    
    // Rola a tela levemente para o alerta se necessário
    alerta.scrollIntoView({ behavior: 'smooth', block: 'end' });
    
    // Esconde o alerta após 4 segundos
    setTimeout(() => {
        alerta.className = 'alerta oculta';
    }, 4000);
}

/**
 * Função utilitária: Evitar ataques XSS injetados via HTML
 */
function escaparHTML(texto) {
    if (!texto) return '';
    const span = document.createElement('span');
    span.textContent = texto;
    return span.innerHTML;
}
