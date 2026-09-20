/**
 * main.js - Lógica de Frontend usando Fetch API com Toasts e Modal moderno
 */

// URL de Produção no Render
const BASE_URL = 'https://mvp2-0-5szr.onrender.com';
const API_URL = `${BASE_URL}/api/projetos`;

// Elementos do DOM
const formProjeto = document.getElementById('form-projeto');
const listaProjetos = document.getElementById('lista-projetos');
const statusBadge = document.getElementById('api-status-badge');
const statusText = document.getElementById('api-status-text');
const toastContainer = document.getElementById('toast-container');
const modalConfirmacao = document.getElementById('modal-confirmacao');
const btnCancelarModal = document.getElementById('btn-cancelar-modal');
const btnConfirmarModal = document.getElementById('btn-confirmar-modal');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeLabel = document.getElementById('theme-label');

// Variável para armazenar o ID do projeto a ser excluído
let projetoIdParaExcluir = null;

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    inicializarTema();
    verificarStatusApi();
    carregarProjetos();
    configurarEventosModal();
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

        mostrarToast('Projeto cadastrado com sucesso!', 'sucesso');
        formProjeto.reset(); 
        carregarProjetos();

    } catch (error) {
        mostrarToast(error.message, 'erro');
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
        
        // Determina cores, ícone e próximo status: Pendente ➔ Em Andamento ➔ Concluído
        let badgeClasse = 'badge-pendente';
        let proximoStatus = 'Em Andamento';
        let iconeStatus = '⏳';

        if (projeto.status === 'Em Andamento') {
            badgeClasse = 'badge-andamento';
            proximoStatus = 'Concluído';
            iconeStatus = '⚡';
        } else if (projeto.status === 'Concluído') {
            badgeClasse = 'badge-concluido';
            proximoStatus = 'Pendente';
            iconeStatus = '✅';
        }

        const div = document.createElement('div');
        div.className = 'projeto-item';
        div.innerHTML = `
            <div class="projeto-info">
                <h3>${escaparHTML(projeto.nome)}</h3>
                <p>${escaparHTML(projeto.descricao || 'Nenhuma descrição fornecida.')}</p>
                <div class="projeto-meta">
                    <button type="button" 
                            class="badge badge-btn ${badgeClasse}" 
                            onclick="alternarStatus(${projeto.id}, '${proximoStatus}')" 
                            title="Clique para avançar para: ${proximoStatus}">
                        <span>${iconeStatus} ${escaparHTML(projeto.status)}</span>
                        <span class="badge-action-label">➔ ${proximoStatus}</span>
                    </button>
                    <small style="color: var(--text-muted); margin-left: 10px;">Criado em: ${dataFormatada}</small>
                </div>
            </div>
            <div class="projeto-acoes">
                <button class="btn btn-danger" onclick="abrirModalExclusao(${projeto.id})">Excluir</button>
            </div>
        `;
        listaProjetos.appendChild(div);
    });
}

/**
 * Atualiza o status do projeto no backend (PATCH)
 */
async function alternarStatus(id, novoStatus) {
    try {
        const response = await fetch(`${API_URL}/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: novoStatus })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.erro || 'Falha ao atualizar status');
        }

        mostrarToast(`Status alterado para "${novoStatus}"!`, 'sucesso');
        carregarProjetos();
    } catch (error) {
        mostrarToast(error.message, 'erro');
    }
}

/**
 * Abre o modal de confirmação para exclusão
 */
function abrirModalExclusao(id) {
    projetoIdParaExcluir = id;
    modalConfirmacao.classList.remove('oculta');
}

/**
 * Fecha o modal de confirmação
 */
function fecharModalExclusao() {
    projetoIdParaExcluir = null;
    modalConfirmacao.classList.add('oculta');
}

/**
 * Configura os listeners do modal
 */
function configurarEventosModal() {
    btnCancelarModal.addEventListener('click', fecharModalExclusao);

    btnConfirmarModal.addEventListener('click', async () => {
        if (!projetoIdParaExcluir) return;

        const id = projetoIdParaExcluir;
        fecharModalExclusao();

        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            const data = await response.json();

            if (!response.ok) throw new Error(data.erro || 'Erro ao deletar o projeto');

            mostrarToast('Projeto excluído com sucesso.', 'sucesso');
            carregarProjetos();
            
        } catch (error) {
            mostrarToast(error.message, 'erro');
        }
    });

    // Fechar ao clicar fora do card
    modalConfirmacao.addEventListener('click', (e) => {
        if (e.target === modalConfirmacao) {
            fecharModalExclusao();
        }
    });

    // Fechar ao pressionar a tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modalConfirmacao.classList.contains('oculta')) {
            fecharModalExclusao();
        }
    });
}

/**
 * Sistema Moderno de Notificações Toast
 * @param {string} mensagem - Texto da mensagem
 * @param {'sucesso'|'erro'|'info'} tipo - Estilo do toast
 */
function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;

    // Ícones SVG para cada tipo
    let iconeSvg = '';
    if (tipo === 'sucesso') {
        iconeSvg = `
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;
    } else if (tipo === 'erro') {
        iconeSvg = `
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        `;
    } else {
        iconeSvg = `
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
        `;
    }

    toast.innerHTML = `
        <div class="toast-icone">
            ${iconeSvg}
        </div>
        <div class="toast-conteudo">
            ${escaparHTML(mensagem)}
        </div>
        <button class="toast-fechar" aria-label="Fechar">&times;</button>
    `;

    toastContainer.appendChild(toast);

    // Animação de entrada
    requestAnimationFrame(() => {
        toast.classList.add('mostrar');
    });

    // Função de saída suave
    const removerToast = () => {
        toast.classList.remove('mostrar');
        toast.classList.add('saindo');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 350);
    };

    // Fechar ao clicar no "X"
    toast.querySelector('.toast-fechar').addEventListener('click', removerToast);

    // Auto-destruição após 4 segundos
    setTimeout(removerToast, 4000);
}

/**
 * Evita ataques XSS básicos
 */
function escaparHTML(texto) {
    if (!texto) return '';
    const span = document.createElement('span');
    span.textContent = texto;
    return span.innerHTML;
}

/**
 * Inicialização e Controle do Tema (Modo Escuro / Claro)
 */
function inicializarTema() {
    const temaSalvo = localStorage.getItem('theme');
    const prefereEscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Aplica o tema salvo ou respeita a preferência do sistema
    if (temaSalvo === 'dark' || (!temaSalvo && prefereEscuro)) {
        aplicarTema('dark', false);
    } else {
        aplicarTema('light', false);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isEscuro = document.documentElement.getAttribute('data-theme') === 'dark';
            aplicarTema(isEscuro ? 'light' : 'dark', true);
        });
    }
}

/**
 * Aplica o tema visual selecionado e persiste no localStorage
 */
function aplicarTema(tema, salvar = true) {
    if (tema === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeLabel) themeLabel.textContent = 'Modo Escuro';
        if (themeToggleBtn) themeToggleBtn.setAttribute('aria-checked', 'true');
        if (salvar) localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        if (themeLabel) themeLabel.textContent = 'Modo Claro';
        if (themeToggleBtn) themeToggleBtn.setAttribute('aria-checked', 'false');
        if (salvar) localStorage.setItem('theme', 'light');
    }
}

