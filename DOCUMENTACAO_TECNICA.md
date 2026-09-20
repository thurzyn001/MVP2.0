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
| **PATCH** | `/api/projetos/:id/status` | Atualiza cirurgicamente o status | `{ "status": "Em Andamento" }` | `200 OK` com o objeto atualizado |
| **DELETE** | `/api/projetos/:id` | Remove permanentemente um registro | N/A | `{ "mensagem": "Projeto deletado" }` |

---

## ✨ 4. Funcionalidades e Diferenciais de Engenharia

### 1. CRUD Completo com Status Dinâmico (PATCH)
* Transição de estados em ciclo contínuo: `Pendente` ➔ `Em Andamento` ➔ `Concluído` ➔ `Pendente`.
* O uso de `PATCH` garante que apenas a propriedade de status seja enviada e alterada na base de dados, reduzindo overhead de tráfego de rede.

### 2. Mini Dashboard de Métricas em Tempo Real
* Cards superiores calculam em memória o total de projetos e a contagem por cada status.
* **Microinteração:** Função de animação com interpolação cúbica (*cubic easing*) via `requestAnimationFrame` para atualização visual fluida dos números.

### 3. Mecanismo de Busca e Filtros Vivos
* Busca instantânea por correspondência case-insensitive em tempo real nos campos de título e descrição.
* **Destaque Visual Seguro:** Realce dos termos pesquisados (`<mark class="highlight">`) com sanitização prévia contra ataques de Cross-Site Scripting (XSS).
* Filtros por chips de status combináveis com contadores independentes.
* Estado vazio contextualizado com atalho de limpeza rápida de filtros.

### 4. Exportação de Dados em CSV e JSON
* **CSV:** Formatação otimizada para o padrão nacional do Microsoft Excel (delimitador ponto e vírgula `;`) e inclusão de **UTF-8 BOM** (`\uFEFF`) para preservar acentos e caracteres especiais.
* **JSON:** Exportação estruturada para interoperabilidade ou backup.
* **Filtro Ativo:** A exportação respeita exatamente os dados visíveis no momento de acordo com os filtros selecionados pelo usuário.

### 5. Boas Práticas de Interface e Usabilidade (UI/UX)
* **Tema Escuro / Claro (Dark Mode):** Alternador estilizado com persistência em `localStorage` e script anti-flash no cabeçalho do documento para evitar oscilações visuais de carregamento.
* **Sistema de Notificações Toast:** Toasts flutuantes com auto-fechamento e limite adaptativo de exibição (máximo de 2 no mobile para evitar obstrução visual e até 5 no desktop).
* **Modal de Confirmação Glassmorphic:** Substituição de diálogos bloqueantes (`window.confirm`) por modal assíncrono com suporte ao teclado (`Escape` para cancelar).
* **Textarea Inteligente:** Auto-expansão vertical proporcional até 180px com barra de rolagem suave e contador de limite máximo de 500 caracteres com alertas de cores.

---

## 🔒 5. Segurança e Validações

1. **Validação de Entrada:** O Backend valida obrigatoriedade de campos obrigatórios e rejeita entradas que ultrapassem o limite estipulado de caracteres.
2. **Prevenção de Injeção de SQL:** Toda comunicação com o PostgreSQL é mediada pelo Prisma Client, utilizando consultas parametrizadas internamente.
3. **Higienização de Saída (Anti-XSS):** Todo texto renderizado dinamicamente no DOM é sanitizado por meio de codificação de entidades HTML antes da inserção na árvore de elementos.

---

*Documentação mantida como artefato técnico para avaliação na disciplina de Laboratório de Programação II.*
