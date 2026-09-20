# Sistema Multicamadas: Gerenciador de Projetos (MVP)

Um sistema multicamadas moderno construído para gerenciar projetos, demonstrando a separação de responsabilidades entre Frontend e Backend e focado nos princípios de APIs REST.

## 🛠️ Tecnologias Utilizadas

**Backend (Cérebro da aplicação):**
- **Node.js:** Ambiente de execução Javascript (server-side).
- **Express.js:** Micro-framework web para criação de rotas REST.
- **Prisma ORM:** Mapeador Objeto-Relacional para comunicação e modelagem do banco de dados.
- **PostgreSQL:** Banco de dados relacional (também configurável para MySQL).

**Frontend (Rosto da aplicação):**
- **PHP:** Linguagem server-side rodando no Apache (XAMPP), responsável por gerar a UI inicial e realizar a validação de proxy através da biblioteca cURL.
- **HTML5 & CSS3:** Estruturação semântica e interface de usuário moderna.
- **Javascript (Vanilla):** Requisições assíncronas utilizando **Fetch API** para uma experiência *Single Page Application* (SPA) parcial.

## 📁 Estrutura de Arquivos
O repositório está logicamente dividido em duas áreas:

```text
/
├── api/                   # Aplicação Backend (Node.js)
│   ├── prisma/            # Modelos de banco de dados (schema.prisma)
│   ├── src/
│   │   ├── controllers/   # Regras de negócios (CRUD)
│   │   └── routes/        # Definição dos endpoints REST
│   ├── package.json       # Configuração de dependências NPM
│   └── server.js          # Entrypoint da API Node.js
│
├── web/                   # Aplicação Frontend (PHP, JS, CSS)
│   ├── assets/            # Arquivos estáticos
│   │   ├── css/           # Folhas de estilo
│   │   └── js/            # Lógica cliente (Fetch API)
│   ├── index.php          # View principal
│   └── ApiClient.php      # Integração do PHP usando cURL
│
└── README.md              # Documentação
```

## 🚀 Como Instalar e Rodar Localmente

### Pré-requisitos
- **Node.js** instalado (v16 ou superior).
- Servidor Web com PHP habilitado como **XAMPP** ou MAMP (apontado para a pasta `/web`).
- Um banco de dados **PostgreSQL** ou MySQL rodando localmente ou remotamente.

### 1. Configurando o Backend (API)
Abra seu terminal e navegue até a pasta `api/`:

```bash
cd api
```

Instale as dependências:
```bash
npm install
```

Crie uma cópia do arquivo `.env.example` e renomeie para `.env`. Depois, coloque as credenciais do seu banco de dados:
```env
PORT=3000
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nomedobanco?schema=public"
```

Sincronize as tabelas do Prisma com o seu banco de dados:
```bash
npx prisma db push
```

Inicie o servidor de desenvolvimento:
```bash
npm run dev
# O servidor rodará em http://localhost:3000
```

### 2. Configurando o Frontend (Web)
1. Inicie o Apache no painel do XAMPP.
2. Certifique-se de que a pasta principal do projeto está no diretório correto do Apache (ex: `htdocs`), ou crie um virtual host apontando para a pasta `web/`.
3. Acesse via navegador `http://localhost/sua_pasta/web/`. A página inicial validará imediatamente se o backend está rodando via cURL e inicializará as requisições Fetch.

## 🌍 Deploy / Hospedagem

O projeto foi criado de forma a possibilitar implantação simplificada em plataformas de nuvem:

- **API Node.js:** Pode ser hospedada em plataformas como **Vercel**, **Render**, ou **Railway**. Basta conectar o repositório, setar o Root Directory para `api/` e inserir a variável `DATABASE_URL`.
- **Banco de Dados:** Pode usar serviços gerenciados gratuitos como **Supabase** (PostgreSQL) ou **Neon**.
- **Frontend (Web):** 
  - Se mantido com PHP (por necessidade de regras servidor), requer serviços como Hostinger ou Heroku.
  - Se o `index.php` for renomeado para `index.html` (e o ApiClient em PHP for abandonado), o front se torna 100% estático e pode ser facilmente deployado gratuitamente pelo **GitHub Pages** ou **Vercel**, bastando alterar o endereço de `API_URL` no `main.js` para o URL de produção da API.

---
*Projeto desenvolvido como laboratório MVP para consolidar conhecimentos em Integração de Sistemas Multicamadas.*
