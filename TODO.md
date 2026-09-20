# 📋 Backlog de Melhorias e Roadmap Técnico (TODO)

Este documento registra as melhorias planejadas, boas práticas identificadas durante os testes e comportamentos específicos de ambientes móveis para evolução do **Gerenciador de Projetos**.

---

## 📌 1. Melhorias e Funcionalidades Concluídas

### 🔹 CRUD e Edição Completa
- [x] Modal interativo para edição de nome e descrição de projetos já cadastrados via `PUT /api/projetos/:id` (concluído com validações, contagem de caracteres e acessibilidade).
- [x] Transição ágil de status nos badges via `PATCH /api/projetos/:id/status`.

### 🔹 Ordenação e Interatividade Visual
- [x] Reordenação completa via Drag-and-Drop com cálculo dinâmico de ponto médio e suporte a touch gestures em mobile.
- [x] Seletor (*dropdown*) integrado para ordenar a listagem por:
  - Mais recentes primeiro (padrão cronológico).
  - Mais antigos primeiro.
  - Ordem alfabética (A-Z e Z-A).
  - Ordem personalizada via Drag-and-Drop (com sincronização bidirecional e persistência em `localStorage`).

### 🔹 Dashboard de Métricas e Feedback
- [x] Cards superiores com contadores numéricos animados por interpolação cúbica.
- [x] Barra de progresso horizontal em degradê moderno indicando a taxa percentual de conclusão das tarefas com atributos WAI-ARIA.

### 🔹 Interface e Usabilidade (UI/UX)
- [x] Reorganização da barra de ferramentas em 2 linhas coordenadas (Linha 1: busca flex + dropdown; Linha 2: pills de status), eliminando qualquer encavalamento visual.
- [x] Limite de 100 caracteres no título com contadores dinâmicos em tempo real no formulário e no modal de edição.
- [x] Auto-expansão vertical suave de até 180px no textarea de descrição, eliminação das alças nativas do navegador (`resize: none`) e scrollbar sutil estilizada.
- [x] Exportação de relatórios em CSV (padrão Excel PT-BR com UTF-8 BOM) e JSON estruturado diretamente pelo navegador via Blob (0ms de latência e sem dependência de rede).

---

## 📌 2. Backlog de Oportunidades Futuras

### 🔹 Paginação de Dados
- [ ] Paginação no backend (`take` e `skip` via Prisma ORM) para otimização de performance caso o volume de projetos cadastrados ultrapasse dezenas ou centenas de registros.

### 🔹 Atalhos e Produtividade
- [ ] Implementar atalho de teclado global para cadastro rápido (ex: `Ctrl + Enter` dentro do formulário).

### 🔹 Exportação Server-Side (Streaming)
- [ ] Endpoints dedicados para exportação direta pelo servidor caso se deseje descarregar a geração de relatórios de bases de dados massivas.

---

*Documento mantido como parte dos critérios de engenharia de software e boas práticas de desenvolvimento da disciplina de Laboratório de Programação II.*
