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
const textareaDescricao = document.getElementById('descricao');
const contadorCaracteres = document.getElementById('contador-caracteres');

// Variáveis para controle de estado
let projetoIdParaExcluir = null;
let todosOsProjetos = [];

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    inicializarTema();
    configurarTextareaDescricao();
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
        resetarTextareaDescricao();
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
        todosOsProjetos = Array.isArray(projetos) ? projetos : [];
        atualizarMetricas(todosOsProjetos);
        renderizarProjetos(todosOsProjetos);
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
                <div class="projeto-rodape">
                    <button type="button" 
                            class="badge badge-btn ${badgeClasse}" 
                            onclick="alternarStatus(${projeto.id}, '${proximoStatus}')" 
                            title="Clique para avançar para: ${proximoStatus}">
                        <span>${iconeStatus} ${escaparHTML(projeto.status)}</span>
                        <span class="badge-action-label">➔ ${proximoStatus}</span>
                    </button>
                    <span class="projeto-data">
                        <svg viewBox="0 0 24 24" width="13" height="13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${dataFormatada}
                    </span>
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
 * Atualiza os contadores no Dashboard de Métricas com animação suave
 * @param {Array} projetos - Lista de projetos
 */
function atualizarMetricas(projetos = []) {
    const total = projetos.length;
    let pendentes = 0;
    let andamento = 0;
    let concluidos = 0;

    projetos.forEach(p => {
        if (p.status === 'Em Andamento') {
            andamento++;
        } else if (p.status === 'Concluído') {
            concluidos++;
        } else {
            pendentes++;
        }
    });

    animarContador('metrica-total', total);
    animarContador('metrica-pendente', pendentes);
    animarContador('metrica-andamento', andamento);
    animarContador('metrica-concluido', concluidos);
}

/**
 * Anima a transição numérica de um contador (easing suave)
 * @param {string} id - ID do elemento DOM
 * @param {number} valorFinal - Valor alvo da contagem
 * @param {number} duracao - Duração em ms (padrão: 400ms)
 */
function animarContador(id, valorFinal, duracao = 400) {
    const elemento = document.getElementById(id);
    if (!elemento) return;

    const valorInicial = parseInt(elemento.textContent, 10) || 0;
    if (valorInicial === valorFinal) {
        elemento.textContent = valorFinal;
        return;
    }

    if (elemento._animFrame) {
        cancelAnimationFrame(elemento._animFrame);
    }

    const tempoInicio = performance.now();

    function atualizar(agora) {
        const tempoDecorrido = agora - tempoInicio;
        const progresso = Math.min(tempoDecorrido / duracao, 1);
        const easeOut = 1 - Math.pow(1 - progresso, 3);
        const valorAtual = Math.round(valorInicial + (valorFinal - valorInicial) * easeOut);

        elemento.textContent = valorAtual;

        if (progresso < 1) {
            elemento._animFrame = requestAnimationFrame(atualizar);
        } else {
            elemento.textContent = valorFinal;
            elemento._animFrame = null;
        }
    }

    elemento._animFrame = requestAnimationFrame(atualizar);
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
    const LIMITE_TOASTS = 5;

    // Se já atingiu o limite de 5 toasts na tela, fecha o mais antigo com animação suave
    const toastsAtivos = Array.from(toastContainer.querySelectorAll('.toast:not(.saindo)'));
    if (toastsAtivos.length >= LIMITE_TOASTS) {
        const maisAntigo = toastsAtivos[0];
        maisAntigo.classList.remove('mostrar');
        maisAntigo.classList.add('saindo');
        setTimeout(() => {
            if (maisAntigo.parentElement) {
                maisAntigo.parentElement.removeChild(maisAntigo);
            }
        }, 350);
    }

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

    // Auto-destruição após 3 segundos
    setTimeout(removerToast, 3000);
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

/**
 * Auto-expansão vertical suave e contador de caracteres para a descrição
 */
function configurarTextareaDescricao() {
    if (!textareaDescricao || !contadorCaracteres) return;

    textareaDescricao.addEventListener('input', () => {
        // Redimensiona verticalmente de forma suave (mínimo 76px, máximo 180px)
        textareaDescricao.style.height = 'auto';
        const novaAltura = Math.min(Math.max(textareaDescricao.scrollHeight, 76), 180);
        textareaDescricao.style.height = `${novaAltura}px`;

        // Atualização em tempo real do contador de caracteres (limite: 500)
        const total = textareaDescricao.value.length;
        const max = 500;
        contadorCaracteres.textContent = `${total} / ${max}`;

        if (total >= max) {
            contadorCaracteres.className = 'char-counter limite-atingido';
        } else if (total >= max * 0.85) {
            contadorCaracteres.className = 'char-counter limite-alerta';
        } else {
            contadorCaracteres.className = 'char-counter';
        }
    });
}

/**
 * Reseta o textarea para a altura e contador iniciais
 */
function resetarTextareaDescricao() {
    if (!textareaDescricao || !contadorCaracteres) return;
    textareaDescricao.style.height = '76px';
    contadorCaracteres.textContent = '0 / 500';
    contadorCaracteres.className = 'char-counter';
}


