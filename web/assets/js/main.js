/**
 * main.js - Lógica de Frontend usando Fetch API
 */

// ATENÇÃO: Quando a API for publicada na nuvem (ex: Render), troque 'http://localhost:3000' pela URL da nuvem.
// Exemplo: const BASE_URL = 'https://minha-api-node.onrender.com';
const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/projetos`;

// Elementos do DOM
const formProjeto = document.getElementById('form-projeto');
const listaProjetos = document.getElementById('lista-projetos');
const alerta = document.getElementById('alerta-sistema');
const statusBadge = document.getElementById('api-status-badge');
const statusText = document.getElementById('api-status-text');

// Ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    verificarStatusApi();
    carregarProjetos();
});

/**
 * Verifica se a API backend está online
 */
async function verificarStatusApi() {
    try {
        const response = await fetch(`${BASE_URL}/api/teste`);
        if (response.ok) {
            const data = await response.json();
            statusBadge.className = 'api-status status-online';
            statusText.textContent = `API Conectada: ${data.mensagem}`;
        } else {
            throw new Error('Falha no ping');
        }
    } catch (error) {
        statusBadge.className = 'api-status status-offline';
        statusText.textContent = 'API Offline. Verifique a URL do backend.';
    }
}

/**
 * Evento: Salvar novo projeto (POST)
 */
formProjeto.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const nome = document.getElementById('nome').value;
    const descricao = document.getElementById('descricao').value;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, descricao })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.erro || 'Ocorreu um erro desconhecido ao salvar.');
        }

        mostrarAlerta('Projeto cadastrado com sucesso!', 'sucesso');
        formProjeto.reset(); 
        carregarProjetos();

    } catch (error) {
        mostrarAlerta(error.message, 'erro');
    }
});

/**
 * Busca os projetos no Backend (GET)
 */
async function carregarProjetos() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) throw new Error('Falha ao buscar projetos');

        const projetos = await response.json();
        renderizarProjetos(projetos);
    } catch (error) {
        listaProjetos.innerHTML = `
            <div class="empty-state" style="color: red;">
                <p>Não foi possível carregar os projetos.</p>
            </div>
        `;
    }
}

/**
 * Renderiza o HTML da lista
 */
function renderizarProjetos(projetos) {
    if (projetos.length === 0) {
        listaProjetos.innerHTML = '<div class="empty-state">Nenhum projeto cadastrado ainda.</div>';
        return;
    }

    listaProjetos.innerHTML = ''; 
    
    projetos.forEach(projeto => {
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
                <button class="btn btn-danger" onclick="deletarProjeto(${projeto.id})">Excluir</button>
            </div>
        `;
        listaProjetos.appendChild(div);
    });
}

/**
 * Deleta um projeto (DELETE)
 */
async function deletarProjeto(id) {
    if (!confirm('Atenção: Tem certeza que deseja excluir?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        const data = await response.json();

        if (!response.ok) throw new Error(data.erro || 'Erro ao deletar o projeto');

        mostrarAlerta('Projeto excluído com sucesso.', 'sucesso');
        carregarProjetos();
        
    } catch (error) {
        mostrarAlerta(error.message, 'erro');
    }
}

function mostrarAlerta(mensagem, tipo) {
    alerta.innerHTML = mensagem;
    alerta.className = `alerta ${tipo}`;
    alerta.scrollIntoView({ behavior: 'smooth', block: 'end' });
    setTimeout(() => alerta.className = 'alerta oculta', 4000);
}

function escaparHTML(texto) {
    if (!texto) return '';
    const span = document.createElement('span');
    span.textContent = texto;
    return span.innerHTML;
}
