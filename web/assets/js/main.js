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
const inputBusca = document.getElementById('input-busca');
const btnLimparBusca = document.getElementById('btn-limpar-busca');
const infoQtdProjetos = document.getElementById('info-quantidade-projetos');
const btnExportCsv = document.getElementById('btn-export-csv');
const btnExportJson = document.getElementById('btn-export-json');

// Variáveis para controle de estado
let projetoIdParaExcluir = null;
let todosOsProjetos = [];
let projetosFiltradosAtuais = [];
let termoBusca = '';
let statusFiltro = 'todos';

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    inicializarTema();
    configurarTextareaDescricao();
    configurarFiltrosEBusca();
    configurarExportacao();
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
        aplicarOrdemSalva();
        atualizarMetricas(todosOsProjetos);
        atualizarContadoresFiltros(todosOsProjetos);
        aplicarFiltros();
    } catch (error) {
        listaProjetos.innerHTML = `
            <div class="empty-state" style="color: red;">
                <p>Não foi possível carregar os projetos.</p>
            </div>
        `;
    }
}

/**
 * Filtra os projetos em memória de acordo com o status e o termo de busca
 */
function aplicarFiltros() {
    const termo = (termoBusca || '').trim().toLowerCase();

    const filtrados = todosOsProjetos.filter(projeto => {
        const matchStatus = (statusFiltro === 'todos') || (projeto.status === statusFiltro);
        
        const nome = (projeto.nome || '').toLowerCase();
        const desc = (projeto.descricao || '').toLowerCase();
        const matchBusca = !termo || nome.includes(termo) || desc.includes(termo);

        return matchStatus && matchBusca;
    });

    projetosFiltradosAtuais = filtrados;
    atualizarContadorHeader(filtrados.length, todosOsProjetos.length);
    atualizarLinksExportacao(filtrados);
    renderizarProjetos(filtrados);
}

/**
 * Atualiza o indicador numérico no topo da seção de projetos
 */
function atualizarContadorHeader(qtdExibida, total) {
    if (!infoQtdProjetos) return;

    if (total === 0) {
        infoQtdProjetos.textContent = '0 projetos';
    } else if (qtdExibida === total) {
        infoQtdProjetos.textContent = `${total} ${total === 1 ? 'projeto' : 'projetos'}`;
    } else {
        infoQtdProjetos.textContent = `${qtdExibida} de ${total} ${total === 1 ? 'projeto' : 'projetos'}`;
    }
}

/**
 * Atualiza os números nos botões/pills de filtro
 */
function atualizarContadoresFiltros(projetos = []) {
    const total = projetos.length;
    let pendentes = 0;
    let andamento = 0;
    let concluidos = 0;

    projetos.forEach(p => {
        if (p.status === 'Em Andamento') andamento++;
        else if (p.status === 'Concluído') concluidos++;
        else pendentes++;
    });

    const elTodos = document.getElementById('filtro-count-todos');
    const elPendente = document.getElementById('filtro-count-pendente');
    const elAndamento = document.getElementById('filtro-count-andamento');
    const elConcluido = document.getElementById('filtro-count-concluido');

    if (elTodos) elTodos.textContent = total;
    if (elPendente) elPendente.textContent = pendentes;
    if (elAndamento) elAndamento.textContent = andamento;
    if (elConcluido) elConcluido.textContent = concluidos;
}

/**
 * Configura os event listeners da barra de busca e dos botões de filtro
 */
function configurarFiltrosEBusca() {
    if (inputBusca) {
        inputBusca.addEventListener('input', (e) => {
            termoBusca = e.target.value;
            if (btnLimparBusca) {
                if (termoBusca.length > 0) {
                    btnLimparBusca.classList.remove('oculta');
                } else {
                    btnLimparBusca.classList.add('oculta');
                }
            }
            aplicarFiltros();
        });

        inputBusca.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                limparBusca();
            }
        });
    }

    if (btnLimparBusca) {
        btnLimparBusca.addEventListener('click', limparBusca);
    }

    const botoesFiltro = document.querySelectorAll('.btn-filtro');
    botoesFiltro.forEach(botao => {
        botao.addEventListener('click', () => {
            botoesFiltro.forEach(b => b.classList.remove('active'));
            botao.classList.add('active');
            statusFiltro = botao.dataset.status || 'todos';
            aplicarFiltros();
        });
    });
}

/**
 * Limpa apenas o campo de busca
 */
function limparBusca() {
    termoBusca = '';
    if (inputBusca) {
        inputBusca.value = '';
        inputBusca.focus();
    }
    if (btnLimparBusca) {
        btnLimparBusca.classList.add('oculta');
    }
    aplicarFiltros();
}

/**
 * Reseta busca e filtros para o estado inicial
 */
function limparFiltros() {
    termoBusca = '';
    statusFiltro = 'todos';

    if (inputBusca) inputBusca.value = '';
    if (btnLimparBusca) btnLimparBusca.classList.add('oculta');

    const botoesFiltro = document.querySelectorAll('.btn-filtro');
    botoesFiltro.forEach(btn => {
        btn.classList.toggle('active', (btn.dataset.status || '') === 'todos');
    });

    aplicarFiltros();
}

/**
 * Atualiza os links nativos <a> de exportação de acordo com os projetos filtrados atuais.
 * O uso de links nativos <a> com o atributo download garante funcionamento 100% contínuo
 * em dispositivos móveis (Android Chrome e Safari iOS) sem sofrer com bloqueio de downloads automáticos.
 */
function atualizarLinksExportacao(lista = []) {
    if (!btnExportCsv || !btnExportJson) return;

    if (!lista || lista.length === 0) {
        btnExportCsv.removeAttribute('href');
        btnExportCsv.removeAttribute('download');
        btnExportJson.removeAttribute('href');
        btnExportJson.removeAttribute('download');
        return;
    }

    // 1. Gera Blob do CSV (Padrão Excel PT-BR com ponto e vírgula e UTF-8 BOM)
    const cabecalhos = ['ID', 'Nome do Projeto', 'Descrição', 'Status', 'Data de Criação'];
    const linhas = lista.map(p => {
        const id = p.id;
        const nome = `"${(p.nome || '').replace(/"/g, '""')}"`;
        const descricao = `"${(p.descricao || '').replace(/"/g, '""')}"`;
        const status = `"${(p.status || '').replace(/"/g, '""')}"`;
        const dataCriacao = p.createdAt ? new Date(p.createdAt) : new Date();
        const dataFormatada = `"${dataCriacao.toLocaleDateString('pt-BR')} ${dataCriacao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}"`;
        return [id, nome, descricao, status, dataFormatada].join(';');
    });

    const conteudoCsv = '\uFEFF' + [cabecalhos.join(';'), ...linhas].join('\r\n');
    const blobCsv = new Blob([conteudoCsv], { type: 'text/csv;charset=utf-8;' });

    if (btnExportCsv._blobUrl) {
        URL.revokeObjectURL(btnExportCsv._blobUrl);
    }
    btnExportCsv._blobUrl = URL.createObjectURL(blobCsv);
    btnExportCsv.href = btnExportCsv._blobUrl;
    btnExportCsv.download = `projetos_${obterTimestampArquivo()}.csv`;

    // 2. Gera Blob do JSON
    const dadosExportar = lista.map(p => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao || '',
        status: p.status,
        createdAt: p.createdAt,
        dataCriacaoFormatada: p.createdAt ? new Date(p.createdAt).toLocaleDateString('pt-BR') : ''
    }));

    const conteudoJson = JSON.stringify(dadosExportar, null, 2);
    const blobJson = new Blob([conteudoJson], { type: 'application/json;charset=utf-8;' });

    if (btnExportJson._blobUrl) {
        URL.revokeObjectURL(btnExportJson._blobUrl);
    }
    btnExportJson._blobUrl = URL.createObjectURL(blobJson);
    btnExportJson.href = btnExportJson._blobUrl;
    btnExportJson.download = `projetos_${obterTimestampArquivo()}.json`;
}

/**
 * Configura os listeners dos links nativos de exportação (CSV e JSON)
 */
function configurarExportacao() {
    if (btnExportCsv) {
        btnExportCsv.addEventListener('click', (e) => {
            if (!btnExportCsv.hasAttribute('href') || !btnExportCsv.getAttribute('href')) {
                e.preventDefault();
                mostrarToast('Nenhum projeto disponível para exportar.', 'info');
                return;
            }
            // Atualiza timestamp para o arquivo baixado
            btnExportCsv.download = `projetos_${obterTimestampArquivo()}.csv`;
            mostrarToast(`${projetosFiltradosAtuais.length} projeto(s) exportado(s) em CSV com sucesso!`, 'sucesso');
        });
    }

    if (btnExportJson) {
        btnExportJson.addEventListener('click', (e) => {
            if (!btnExportJson.hasAttribute('href') || !btnExportJson.getAttribute('href')) {
                e.preventDefault();
                mostrarToast('Nenhum projeto disponível para exportar.', 'info');
                return;
            }
            // Atualiza timestamp para o arquivo baixado
            btnExportJson.download = `projetos_${obterTimestampArquivo()}.json`;
            mostrarToast(`${projetosFiltradosAtuais.length} projeto(s) exportado(s) em JSON com sucesso!`, 'sucesso');
        });
    }
}

/**
 * Retorna data e hora únicas (YYYY-MM-DD_HHMMSS) para cada download
 */
function obterTimestampArquivo() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const horas = String(hoje.getHours()).padStart(2, '0');
    const minutos = String(hoje.getMinutes()).padStart(2, '0');
    const segundos = String(hoje.getSeconds()).padStart(2, '0');
    return `${ano}-${mes}-${dia}_${horas}${minutos}${segundos}`;
}

/**
 * Destaca com segurança contra XSS as palavras pesquisadas
 */
function destacarTermo(texto, termo) {
    if (!texto) return '';
    const textoSeguro = escaparHTML(texto);
    if (!termo || !termo.trim()) return textoSeguro;

    const termoSeguro = escaparHTML(termo.trim());
    const regex = new RegExp(`(${termoSeguro.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return textoSeguro.replace(regex, '<mark class="highlight">$1</mark>');
}

/**
 * Renderiza o HTML da lista
 */
function renderizarProjetos(projetos) {
    if (todosOsProjetos.length === 0) {
        listaProjetos.innerHTML = '<div class="empty-state">Nenhum projeto cadastrado ainda.</div>';
        return;
    }

    if (projetos.length === 0) {
        listaProjetos.innerHTML = `
            <div class="empty-state empty-search">
                <svg viewBox="0 0 24 24" width="38" height="38" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <h3>Nenhum projeto encontrado</h3>
                <p>Não encontramos nenhum projeto com os filtros e termo de busca aplicados.</p>
                <button type="button" class="btn btn-secondary btn-sm" onclick="limparFiltros()">Limpar Filtros</button>
            </div>
        `;
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
        div.dataset.id = projeto.id;
        div.innerHTML = `
            <div class="drag-handle" title="Arraste para reordenar" aria-label="Arraste para reordenar">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <circle cx="9" cy="5" r="1.5"></circle>
                    <circle cx="9" cy="12" r="1.5"></circle>
                    <circle cx="9" cy="19" r="1.5"></circle>
                    <circle cx="15" cy="5" r="1.5"></circle>
                    <circle cx="15" cy="12" r="1.5"></circle>
                    <circle cx="15" cy="19" r="1.5"></circle>
                </svg>
            </div>
            <div class="projeto-info">
                <h3>${destacarTermo(projeto.nome, termoBusca)}</h3>
                <p>${destacarTermo(projeto.descricao || 'Nenhuma descrição fornecida.', termoBusca)}</p>
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

    configurarDragAndDrop();
}

/**
 * Aplica a ordem personalizada dos projetos salva no localStorage
 */
function aplicarOrdemSalva() {
    try {
        const ordemSalva = localStorage.getItem('projetos_ordem');
        if (!ordemSalva) return;

        const idsOrdenados = JSON.parse(ordemSalva);
        if (!Array.isArray(idsOrdenados) || idsOrdenados.length === 0) return;

        const posicoes = new Map();
        idsOrdenados.forEach((id, index) => {
            posicoes.set(isNaN(Number(id)) ? id : Number(id), index);
        });

        todosOsProjetos.sort((a, b) => {
            const posA = posicoes.has(a.id) ? posicoes.get(a.id) : -1;
            const posB = posicoes.has(b.id) ? posicoes.get(b.id) : -1;

            if (posA === -1 && posB === -1) return 0;
            if (posA === -1) return -1;
            if (posB === -1) return 1;

            return posA - posB;
        });

        // Limpa referências a projetos excluídos
        const idsExistentes = new Set(todosOsProjetos.map(p => p.id));
        const idsAtualizados = idsOrdenados.filter(id => idsExistentes.has(isNaN(Number(id)) ? id : Number(id)));
        if (idsAtualizados.length !== idsOrdenados.length) {
            localStorage.setItem('projetos_ordem', JSON.stringify(idsAtualizados));
        }
    } catch (e) {
        console.warn('Não foi possível carregar a ordem salva:', e);
    }
}

/**
 * Configura o sistema de arrastar e soltar (Drag and Drop) para reordenação de projetos.
 * Suporta Desktop (HTML5 Drag & Drop com alça) e Mobile (Touch Gestures).
 */
function configurarDragAndDrop() {
    if (!listaProjetos) return;

    const cards = listaProjetos.querySelectorAll('.projeto-item');
    if (cards.length === 0) return;

    cards.forEach(card => {
        const handle = card.querySelector('.drag-handle');
        if (!handle) return;

        let handlePressionada = false;

        // Desktop: Mousedown na alça habilita o drag no card
        handle.addEventListener('mousedown', () => {
            handlePressionada = true;
            card.setAttribute('draggable', 'true');
        });

        card.addEventListener('dragstart', (e) => {
            if (!handlePressionada) {
                e.preventDefault();
                return;
            }
            card.classList.add('dragging');
            if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', card.dataset.id || '');
            }
        });

        card.addEventListener('dragend', () => {
            handlePressionada = false;
            card.classList.remove('dragging');
            card.setAttribute('draggable', 'false');
            salvarNovaOrdem();
        });

        // Mobile: Eventos de Touch dedicados na alça
        handle.addEventListener('touchstart', () => {
            card.classList.add('dragging');
        }, { passive: true });

        handle.addEventListener('touchmove', (e) => {
            if (!card.classList.contains('dragging')) return;
            if (e.cancelable) e.preventDefault();

            const touchY = e.touches[0].clientY;
            const proximoElemento = obterElementoAposPosicao(listaProjetos, touchY);

            if (proximoElemento == null) {
                listaProjetos.appendChild(card);
            } else if (proximoElemento !== card) {
                listaProjetos.insertBefore(card, proximoElemento);
            }
        }, { passive: false });

        handle.addEventListener('touchend', () => {
            if (card.classList.contains('dragging')) {
                card.classList.remove('dragging');
                salvarNovaOrdem();
            }
        });

        handle.addEventListener('touchcancel', () => {
            if (card.classList.contains('dragging')) {
                card.classList.remove('dragging');
                salvarNovaOrdem();
            }
        });
    });

    // Listener global no container para dragover de mouse desktop (apenas uma vez)
    if (!listaProjetos._dragOverConfigurado) {
        listaProjetos.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingCard = listaProjetos.querySelector('.projeto-item.dragging');
            if (!draggingCard) return;

            const proximoElemento = obterElementoAposPosicao(listaProjetos, e.clientY);
            if (proximoElemento == null) {
                listaProjetos.appendChild(draggingCard);
            } else if (proximoElemento !== draggingCard) {
                listaProjetos.insertBefore(draggingCard, proximoElemento);
            }
        });

        // Reseta atributos draggable caso o usuário solte o mouse fora
        document.addEventListener('mouseup', () => {
            const cardsArrastaveis = listaProjetos.querySelectorAll('.projeto-item[draggable="true"]');
            cardsArrastaveis.forEach(c => {
                if (!c.classList.contains('dragging')) {
                    c.setAttribute('draggable', 'false');
                }
            });
        });

        listaProjetos._dragOverConfigurado = true;
    }
}

/**
 * Calcula qual elemento deve ficar após a posição Y atual do cursor/toque
 * baseando-se no ponto médio (centro vertical) dos outros cards
 * @param {HTMLElement} container - O container da lista
 * @param {number} y - Posição Y (clientY) do cursor ou toque
 * @returns {HTMLElement|null} - O elemento que deve ficar imediatamente abaixo do item arrastado
 */
function obterElementoAposPosicao(container, y) {
    const elementosArrastaveis = [...container.querySelectorAll('.projeto-item:not(.dragging)')];

    return elementosArrastaveis.reduce((maisProximo, elemento) => {
        const box = elemento.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > maisProximo.offset) {
            return { offset: offset, element: elemento };
        } else {
            return maisProximo;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/**
 * Salva a nova ordem dos projetos no localStorage e sincroniza as listas em memória
 */
function salvarNovaOrdem() {
    const cards = listaProjetos.querySelectorAll('.projeto-item[data-id]');
    if (!cards || cards.length === 0) return;

    const idsVisiveis = Array.from(cards).map(card => {
        const idRaw = card.dataset.id;
        return isNaN(Number(idRaw)) ? idRaw : Number(idRaw);
    });

    let ordemCompleta = todosOsProjetos.map(p => p.id);

    if (statusFiltro === 'todos' && !termoBusca) {
        ordemCompleta = idsVisiveis;
    } else {
        const visiveisSet = new Set(idsVisiveis);
        let ptr = 0;
        ordemCompleta = ordemCompleta.map(id => {
            if (visiveisSet.has(id)) {
                return idsVisiveis[ptr++];
            }
            return id;
        });
    }

    try {
        localStorage.setItem('projetos_ordem', JSON.stringify(ordemCompleta));
    } catch (e) {
        console.warn('Erro ao salvar ordem no localStorage:', e);
    }

    const mapa = new Map(todosOsProjetos.map(p => [p.id, p]));
    todosOsProjetos = ordemCompleta.map(id => mapa.get(id)).filter(Boolean);

    const idsVisiveisSet = new Set(idsVisiveis);
    projetosFiltradosAtuais = todosOsProjetos.filter(p => idsVisiveisSet.has(p.id));
    atualizarLinksExportacao(projetosFiltradosAtuais);
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
    // No celular (telas menores ou iguais a 640px), limita a no máximo 2 toasts para não cobrir a tela. No PC, mantém até 5.
    const isMobile = window.innerWidth <= 640;
    const LIMITE_TOASTS = isMobile ? 2 : 5;

    // Se já atingiu o limite, fecha o(s) mais antigo(s) com animação suave
    const toastsAtivos = Array.from(toastContainer.querySelectorAll('.toast:not(.saindo)'));
    while (toastsAtivos.length >= LIMITE_TOASTS) {
        const maisAntigo = toastsAtivos.shift();
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


