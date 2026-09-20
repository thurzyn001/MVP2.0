# Sistema Multicamadas: Gerenciador de Projetos

Um sistema multicamadas moderno construído para gerenciar projetos, demonstrando a separação total de responsabilidades entre Frontend e Backend, preparado para rodar 100% na nuvem (Serverless e PaaS).

## 🛠️ Tecnologias Utilizadas

**Banco de Dados (Dados):**
- **Neon / PostgreSQL:** Banco de dados relacional serverless.
- **Prisma ORM:** Mapeador Objeto-Relacional para comunicação e modelagem.

**Backend (Cérebro da aplicação):**
- **Node.js & Express.js:** API RESTful que centraliza as regras de negócio.
- Hospedagem recomendada: **Render.com**.

**Frontend (Rosto da aplicação):**
- **HTML5, CSS3 & Javascript (Vanilla):** Interface estática (SPA parcial).
- **Fetch API:** Requisições assíncronas ao backend para criar, listar e deletar projetos sem recarregar a tela.
- Hospedagem recomendada: **Vercel** ou **GitHub Pages**.

## 📁 Estrutura de Arquivos
O repositório está logicamente dividido em duas áreas:

```text
/
├── api/                   # Aplicação Backend (Node.js)
│   ├── prisma/            # Modelos de banco de dados (schema.prisma)
│   ├── src/
│   │   ├── controllers/   # Regras de negócios (CRUD)
│   │   └── routes/        # Definição dos endpoints REST
│   ├── package.json       # Scripts (start/dev) e dependências
│   └── server.js          # Entrypoint da API Node.js
│
├── web/                   # Aplicação Frontend (Estática)
│   ├── assets/            # Arquivos estáticos
│   │   ├── css/           # Folhas de estilo (style.css)
│   │   ├── js/            # Lógica cliente (main.js)
│   │   └── img/           # Imagens e ícones (favicon.ico, logo.png)
│   └── index.html         # View principal da aplicação
│
├── README.md              # Documentação principal
├── DOCUMENTACAO_TECNICA.md # Especificações de arquitetura e API
└── TODO.md                # Backlog e roadmap técnico
```

---

## 📘 Documentação de Arquitetura & API
Para uma visão aprofundada da topologia multicamadas, tabela completa de endpoints REST, regras de segurança e detalhes de engenharia, consulte o arquivo **[DOCUMENTACAO_TECNICA.md](DOCUMENTACAO_TECNICA.md)**.

---

## ✨ Principais Funcionalidades

- **CRUD Completo & Transição Rápida de Status (PATCH):** Cadastro, listagem, exclusão segura com modal de confirmação estilizado e avanço de status interativo nos badges (`Pendente` ➔ `Em Andamento` ➔ `Concluído`).
- **Mini Dashboard de Métricas:** Cards no topo com contadores em tempo real para Total, Pendentes, Em Andamento e Concluídos com animação de contagem fluida.
- **Busca em Tempo Real & Filtros de Status:** Pesquisa instantânea com destaque visual dos termos (`<mark>`) combinada a chips de status com contadores ativos e estado vazio inteligente com botão de restauração rápida.
- **Exportação de Relatórios (CSV & JSON):** Geração de planilhas Excel (com separador `;` e `UTF-8 BOM` para caracteres especiais) e dados estruturados JSON, respeitando os filtros selecionados na tela.
- **Modo Escuro / Claro (Dark Mode):** Alternador animado na barra superior com persistência em `localStorage` e script anti-flash no carregamento.
- **Notificações Toast Responsivas:** Notificações flutuantes modernas com animação de entrada/saída e limite dinâmico de exibição adaptado para telas mobile (máx. 2) e desktop (máx. 5).

---

## 📋 Backlog & Roadmap Técnico
Para detalhes sobre as próximas evoluções planejadas e considerações técnicas de compatibilidade identificadas durante os testes, consulte o arquivo [TODO.md](TODO.md).

---

## 🚀 Como Fazer o Deploy Completo na Nuvem

Este projeto foi desenhado para plataformas gratuitas modernas. Siga os passos abaixo para colocar tudo no ar:

### Passo 1: Banco de Dados (Neon)
1. Crie uma conta no [Neon.tech](https://neon.tech/) e inicie um novo projeto.
2. Copie a sua **Connection String** (algo como `postgresql://neondb_owner:senha@ep-nome...aws.neon.tech/nome_db?sslmode=require`).
3. Localmente, no seu terminal dentro da pasta `api`, crie o arquivo `.env` com a sua URL e rode:
   ```bash
   npx prisma db push
   ```
   *(Isso criará a estrutura de tabelas na nuvem).*

### Passo 2: Backend da API (Render.com)
1. Suba este repositório para o seu **GitHub**.
2. Crie uma conta no [Render](https://render.com/) e clique em **New > Web Service**.
3. Conecte o seu repositório.
4. **Configurações essenciais no Render:**
   - **Root Directory:** Digite `api` *(indica que o servidor Node está nessa pasta)*.
   - **Build Command:** Substitua qualquer sugestão padrão (como `yarn`) por:
     ```bash
     npm install && npx prisma generate
     ```
     *(Garante a instalação dos pacotes e a geração do cliente Prisma em produção)*.
   - **Start Command:** Substitua qualquer sugestão padrão (como `yarn start`) por:
     ```bash
     npm start
     ```
     *(Inicia o servidor executando o script configurado no `package.json`)*.
5. **Environment Variables (Variáveis de Ambiente):**
   - Adicione uma variável com **Key** `DATABASE_URL` e cole a URL do seu Neon no **Value**.
6. Clique em **Create Web Service**. Em poucos minutos, o Render fornecerá a URL da sua API (ex: `https://sua-api.onrender.com`).

### Passo 3: Frontend (Vercel)
1. No seu código local, abra o arquivo `web/assets/js/main.js`.
2. Altere a variável `BASE_URL` (logo no topo) para a URL que o Render acabou de gerar para você:
   ```javascript
   const BASE_URL = 'https://sua-api.onrender.com';
   ```
3. Faça o commit dessa alteração (`git commit`) e suba para o GitHub (`git push`).
4. Crie uma conta na [Vercel](https://vercel.com/) e adicione um **New Project**.
5. Importe este mesmo repositório do GitHub.
6. Na configuração do projeto na Vercel, em **Root Directory**, altere para `web`.
7. Clique em **Deploy**.

🎉 **Pronto!** O seu frontend na Vercel está agora se comunicando com o seu backend no Render, salvando e excluindo dados permanentemente no banco de dados Neon. Tudo online!

---
*Trabalho desenvolvido para a disciplina de Laboratório de Programação I como forma de demonstração prática dos conhecimentos adquiridos e obtenção de nota avaliativa.*
