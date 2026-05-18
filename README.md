# EduTrack AI

EduTrack é uma plataforma inovadora projetada para gerenciar disciplinas e tarefas, integrando uma aplicação móvel com um microsserviço de Inteligência Artificial para gerar insights sobre o progresso e o desempenho dos usuários.

## Tecnologias Utilizadas

**Frontend (Mobile):**
- [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- Supabase Client (`@supabase/supabase-js`)

**Backend (Microservice):**
- [FastAPI](https://fastapi.tiangolo.com/) (Python)
- Uvicorn (Servidor ASGI)
- HTTPX (Requisições assíncronas)

**Banco de Dados & Autenticação:**
- [Supabase](https://supabase.com/) (PostgreSQL)

## Estrutura do Projeto

O repositório é dividido em duas partes principais:

- `/edutrack-mobile`: Aplicativo frontend desenvolvido em React Native e Expo. Contém as telas de autenticação, dashboard, listagem de tarefas e criação de conteúdo.
- `/edutrack-api`: Microsserviço em FastAPI responsável pela integração de IA e geração de insights analíticos baseados nas tarefas dos usuários.
- `/docs`: Contém documentações importantes, como o esquema do banco de dados (Supabase).

## Como Executar o Projeto Localmente

### 1. Pré-requisitos
- Node.js (v18+)
- Python (3.10+)
- Conta no Supabase configurada

### 2. Configurando o Banco de Dados
Execute o script SQL disponível em `docs/04. Supabase Schema.sql` no painel SQL do seu projeto no Supabase para criar as tabelas e políticas de segurança necessárias.

### 3. Rodando o Mobile (Expo)
```bash
cd edutrack-mobile
# Instale as dependências
npm install
# Configure as variáveis de ambiente baseadas no .env.example
cp .env.example .env
# Inicie o servidor de desenvolvimento
npm start
```

### 4. Rodando o Backend (API)
```bash
cd edutrack-api
# Crie um ambiente virtual (recomendado)
python -m venv venv
# Ative o ambiente (Windows)
venv\Scripts\activate
# Ative o ambiente (Linux/Mac)
# source venv/bin/activate
# Instale as dependências
pip install -r requirements.txt
# Configure as variáveis de ambiente baseadas no .env.example
cp .env.example .env
# Inicie a API com Uvicorn
uvicorn main:app --reload
```

## Licença

Consulte o arquivo LICENSE para obter detalhes.
