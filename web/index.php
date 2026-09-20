<?php
require_once 'ApiClient.php';

// Inicializa a conexão para verificar se a API está no ar
$api = new ApiClient();
$statusApi = $api->testarConexao();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciador de Projetos - MVP</title>
    <!-- CSS Estilizado Profissionalmente (Checkpoint 8) -->
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <div class="container">
        <header class="header-main">
            <h1>Painel de Projetos (MVP)</h1>
            
            <!-- Exibição do Status da API baseado no cURL do PHP -->
            <div class="api-status <?php echo $statusApi ? 'status-online' : 'status-offline'; ?>">
                <?php if($statusApi): ?>
                    <span class="status-indicator"></span> 
                    API Conectada: <?php echo htmlspecialchars($statusApi['mensagem']); ?>
                <?php else: ?>
                    <span class="status-indicator"></span> 
                    API Offline. Verifique se o servidor Node.js está rodando na porta 3000.
                <?php endif; ?>
            </div>
        </header>

        <main>
            <!-- Tela de Cadastro (Checkpoint 6) -->
            <section class="card mb-2">
                <h2>Cadastrar Novo Projeto</h2>
                
                <!-- Div para exibição de mensagens de sucesso ou erro -->
                <div id="alerta-sistema" class="alerta oculta"></div>
                
                <form id="form-projeto">
                    <div class="form-group">
                        <label for="nome">Nome do Projeto <span class="required">*</span></label>
                        <input type="text" id="nome" name="nome" placeholder="Ex: E-commerce de Sapatos" autocomplete="off">
                    </div>
                    
                    <div class="form-group">
                        <label for="descricao">Descrição</label>
                        <textarea id="descricao" name="descricao" rows="3" placeholder="Descreva brevemente o projeto..."></textarea>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">
                        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="icon"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                        Salvar Projeto
                    </button>
                </form>
            </section>

            <!-- Lista de Projetos Renderizada via Fetch API (Checkpoint 7) -->
            <section class="card">
                <h2>Projetos Cadastrados</h2>
                
                <div id="lista-projetos" class="lista-projetos">
                    <div class="loading-state">Carregando projetos...</div>
                </div>
            </section>
        </main>
    </div>

    <!-- Scripts com Fetch API -->
    <script src="assets/js/main.js"></script>
</body>
</html>
