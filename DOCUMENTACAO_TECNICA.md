# 📘 Documentação Técnica: Gerenciador de Projetos

Este documento detalha as especificações técnicas, decisões de arquitetura e o modelo de comunicação do **Gerenciador de Projetos**, desenvolvido para a disciplina de **Laboratório de Programação II**.

---

## 📌 1. Visão Geral do Sistema e Princípios de Arquitetura

O sistema foi concebido sob o modelo de **Arquitetura Multicamadas (*Multi-tier Architecture*)**, orientado ao desacoplamento completo entre as responsabilidades de armazenamento, regras de negócios e interface com o usuário:

* **Desacoplamento Front/Back:** O Frontend opera de forma estática como uma *Single Page Application* (SPA parcial) e comunica-se com o Backend exclusivamente via requisições HTTP assíncronas utilizando payloads no formato JSON.
* **Segurança de Dados:** O Frontend nunca acessa diretamente o banco de dados. Todas as operações passam obrigatoriamente pela validação do Backend.
* **Persistência Relacional:** O acesso ao banco relacional é abstraído por um ORM (*Object-Relational Mapping*), eliminando riscos de SQL Injection manual e garantindo consistência no ciclo de vida dos dados.

---

## 🏛️ 2. Arquitetura Multicamadas (Full Cloud)

A topologia da aplicação é dividida em três camadas operando de forma independente na nuvem:

```text
┌────────────────────────────────────────────────────────┐
│                   1. CAMADA DE APRESENTAÇÃO            │
│                Frontend (Vercel / SPA Estática)        │
│          HTML5 Semântico • CSS3 Moderno • Vanilla JS   │
└───────────────────────────▲────────────────────────────┘
                            │
               Requisições HTTP / REST (JSON)
                            │
┌───────────────────────────▼────────────────────────────┐
│                    2. CAMADA DE NEGÓCIO                │
│                   Backend (Render / PaaS)              │
│               Node.js • Express.js • Prisma ORM        │
└───────────────────────────▲────────────────────────────┘
                            │
                 Conexão Segura SSL / TCP
                            │
┌───────────────────────────▼────────────────────────────┐
│                     3. CAMADA DE DADOS                 │
│                 Banco de Dados (Neon.tech)             │
│                PostgreSQL Serverless na Nuvem          │
└────────────────────────────────────────────────────────┘
```

### 🔹 1ª Camada: Apresentação (Frontend)
* **Hospedagem:** Vercel (Edge Network / CDN global).
* **Stack:** HTML5 semântico, CSS3 moderno (Custom Properties, Flexbox, CSS Grid) e JavaScript puro (*Vanilla JS*).
* **Comunicação:** `Fetch API` nativa com `async/await` para consultas assíncronas sem recarregamento de página.

### 🔹 2ª Camada: Lógica de Negócios (Backend)
* **Hospedagem:** Render.com (PaaS - *Platform as a Service*).
* **Stack:** Node.js com o microframework Express.js.
* **Camada de Dados:** Prisma ORM para mapeamento e consultas tipadas ao banco de dados.
* **Segurança & CORS:** Middlewares de controle de acesso HTTP (`cors`) e parse de corpo de requisição (`express.json()`).

### 🔹 3ª Camada: Persistência (Banco de Dados)
* **Hospedagem:** Neon.tech (PostgreSQL Serverless).
* **Características:** Armazenamento relacional com suporte a SSL obrigatório, escalabilidade sob demanda e chaves autoincrementais.

---

## ⚡ 3. Especificação da API RESTful

A API expõe endpoints estruturados conforme os padrões REST, utilizando códigos de status HTTP adequados (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `500 Internal Error`):

| Método | Rota | Descrição | Corpo da Requisição (Payload) | Resposta de Sucesso |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/teste` | Verificação de integridade (*Health Check*) | N/A | `{ "mensagem": "..." }` |
| **GET** | `/api/projetos` | Recupera a lista completa de projetos | N/A | `[ { "id": 1, "nome": "...", ... } ]` |
| **POST** | `/api/projetos` | Cadastra um novo projeto | `{ "nome": "...", "descricao": "..." }` | `201 Created` com o objeto criado |
| **PUT** | `/api/projetos/:id` | Atualiza dados cadastrais (Nome e Descrição) | `{ "nome": "...", "descricao": "..." }` | `200 OK` com o objeto atualizado |
| **PATCH** | `/api/projetos/:id/status` | Atualiza cirurgicamente o status | `{ "status": "Em Andamento" }` | `200 OK` com o objeto atualizado |
| **DELETE** | `/api/projetos/:id` | Remove permanentemente um registro | N/A | `{ "mensagem": "Projeto deletado" }` |

---

## ✨ 4. Funcionalidades e Diferenciais de Engenharia

### 1. CRUD 100% Completo (Create, Read, Update, Delete)
* **Edição Cadastral Completa (`PUT`):** Modal interativo com formulário pré-preenchido que permite alterar título e descrição de projetos já cadastrados, contando com validação de campos obrigatórios e limites estipulados (100 caracteres para o nome e 500 para a descrição).
* **Transição Ágil de Status (`PATCH`):** Ciclo contínuo `Pendente` ➔ `Em Andamento` ➔ `Concluído` ➔ `Pendente`. O uso de `PATCH` garante alteração pontual no banco de dados sem overhead de rede.

### 2. Reordenação Interativa com Drag-and-Drop (Arrastar e Soltar)
* **Cálculo de Ponto Médio Dinâmico:** Ao arrastar um card, o sistema calcula o centro vertical dos outros cards em tempo real e reposiciona os elementos automaticamente.
* **Compatibilidade Desktop e Mobile:** Alça de arrasto dedicada (`.drag-handle`) com suporte a HTML5 Drag API no mouse e Touch Gestures nativos com `touch-action: none;` no celular.
* **Persistência Local:** Ordem personalizada persistida no `localStorage`, restaurada no reload e sincronizada com as exportações em CSV/JSON.

### 3. Mini Dashboard de Métricas e Taxa de Conclusão Dinâmica
* **Contadores com Easing Suave:** Cards superiores calculam em memória o total de projetos e a contagem por cada status, com interpolação cúbica (*cubic easing*) via `requestAnimationFrame` para atualização visual fluida dos números.
* **Barra de Progresso Horizontal:** Exibe a taxa percentual de tarefas concluídas em relação ao total, com barra em degradê moderno (`#3b82f6` a `#10b981`), transição de largura suave e texto descritivo contextual (incluindo estado comemorativo de 100% de conclusão).
* **Acessibilidade:** Implementado com padrão WAI-ARIA (`role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`).

### 4. Mecanismo de Busca, Ordenação Dinâmica e Filtros Vivos
* **Busca Instantânea & Destaque Visual Seguro:** Correspondência case-insensitive em tempo real nos campos de título e descrição, com realce visual (`<mark class="highlight">`) e sanitização prévia contra ataques de Cross-Site Scripting (XSS).
* **Seletor de Ordenação Rápida:** Dropdown integrado à barra de ferramentas que permite ordenar a visualização instantaneamente por *Mais Recentes*, *Mais Antigos*, *Nome A-Z*, *Nome Z-A* e *Ordem Personalizada*. Sincroniza-se de forma bidirecional com o Drag-and-Drop e persiste a preferência em `localStorage`.
* **Filtros por Status:** Chips com contadores numéricos independentes e atualização reativa.
* **Estado Vazio Contextualizado:** Feedback visual limpo quando a busca ou filtros não retornam resultados, com botão de reset rápido.

### 5. Exportação de Dados em CSV e JSON
* **CSV:** Formatação otimizada para o padrão nacional do Microsoft Excel (delimitador ponto e vírgula `;`) e inclusão de **UTF-8 BOM** (`\uFEFF`) para preservar acentos e caracteres especiais.
* **JSON:** Exportação estruturada para interoperabilidade ou backup.
* **Filtro Ativo:** A exportação respeita exatamente os dados visíveis no momento de acordo com os filtros selecionados pelo usuário.

### 6. Boas Práticas de Interface e Usabilidade (UI/UX)
* **Tema Escuro / Claro (Dark Mode):** Alternador estilizado com persistência em `localStorage` e script anti-flash no cabeçalho do documento para evitar oscilações visuais de carregamento.
* **Sistema de Notificações Toast:** Toasts flutuantes com auto-fechamento e limite adaptativo de exibição (máximo de 2 no mobile para evitar obstrução visual e até 5 no desktop).
* **Modais Assíncronos Glassmorphic:** Modais modernos para exclusão e edição com suporte a acessibilidade via teclado (`Escape` para fechar e clique no backdrop).
* **Campos com Contadores Inteligentes:** Contador visual dinâmico com limite de 100 caracteres no título e 500 caracteres na descrição (com auto-expansão vertical de até 180px), dotados de feedback visual colorido por proximidade (alerta amarelo aos 85% e limite vermelho aos 100%).

---

## 🔒 5. Segurança e Validações

1. **Validação e Defesa em Profundidade (Defense-in-Depth):** O Backend valida a obrigatoriedade e integridade de tipos, rejeitando payloads com títulos superiores a 100 caracteres ou descrições superiores a 500 caracteres (`400 Bad Request`), operando em consonância com o atributo `maxlength` e contadores no Frontend.
2. **Prevenção de Injeção de SQL:** Toda comunicação com o PostgreSQL é mediada pelo Prisma Client, utilizando consultas parametrizadas internamente.
3. **Higienização de Saída (Anti-XSS):** Todo texto renderizado dinamicamente no DOM é sanitizado por meio de codificação de entidades HTML antes da inserção na árvore de elementos.

---

*Documentação mantida como artefato técnico para avaliação na disciplina de Laboratório de Programação II.*
