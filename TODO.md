# 📋 Backlog de Melhorias e Roadmap Técnico (TODO)

Este documento registra as melhorias planejadas, boas práticas identificadas durante os testes e comportamentos específicos de ambientes móveis para evolução do **Gerenciador de Projetos**.

---

## 📌 1. Exportação de Relatórios no Ambiente Mobile (Backend Streaming)

- [ ] **Migrar geração de arquivos CSV/JSON do Client-side (Frontend) para o Server-side (Backend)**
  - **Contexto & Diagnóstico Atual:**
    - No Desktop, o download via memória do navegador (`Blob` e `URL.createObjectURL`) funciona de forma contínua e sem restrições.
    - Em dispositivos móveis (notadamente Google Chrome no Android e Safari no iOS), políticas rigorosas de sandbox e prevenção contra múltiplos downloads automáticos (*Automatic Downloads Prevention*) permitem que o primeiro arquivo seja salvo com sucesso, mas podem restringir downloads consecutivos sem que o usuário recarregue a página.
  - **Solução Arquitetural Planejada:**
    - Criar endpoints dedicados no Backend Express:
      - `GET /api/projetos/export/csv`
      - `GET /api/projetos/export/json`
    - O backend realiza a consulta e envia o arquivo diretamente como fluxo HTTP com os cabeçalhos:
      ```http
      Content-Type: text/csv; charset=utf-8
      Content-Disposition: attachment; filename="projetos.csv"
      ```
    - **Benefício:** Elimina qualquer dependência de manipulação de memória no navegador móvel, tornando o download 100% nativo e ilimitado em qualquer smartphone ou WebView.

---

## 📌 2. Funcionalidades Futuras Planejadas

### 🔹 Edição Completa de Projetos
- [ ] Modal interativo para edição de nome e descrição de projetos já cadastrados (atualmente a edição rápida contempla a transição de status via `PATCH`).

### 🔹 Ordenação Dinâmica
- [ ] Seletor (*dropdown*) para ordenar a listagem de projetos por:
  - Mais recentes primeiro (padrão atual).
  - Mais antigos primeiro.
  - Ordem alfabética (A-Z / Z-A).

### 🔹 Paginação de Dados
- [ ] Paginação no backend (`take` e `skip` via Prisma ORM) para otimização de performance caso o volume de projetos cadastrados ultrapasse dezenas ou centenas de registros.

### 🔹 Notificações e Confirmações Adicionais
- [ ] Implementar atalho de teclado global para cadastro rápido (ex: `Ctrl + Enter` dentro do formulário).

---

*Documento mantido como parte dos critérios de engenharia de software e boas práticas de desenvolvimento da disciplina de Laboratório de Programação I.*
