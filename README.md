# Portfólio 3D — computador anos 90

Portfólio pessoal: uma escrivaninha noturna em 3D com um PC bege e monitor CRT. A câmera se aproxima, o monitor liga e aparece uma área de trabalho estilo Windows 95 em que cada ícone é um app (Sobre mim, Projetos, Skills, Experiência, Currículo, Contato…). Um painel em `/admin` edita textos, curadoria de projetos do GitHub e o currículo, sem novo deploy.

- **Stack:** Next.js 15 (App Router) · React Three Fiber · Supabase (Postgres + Storage + Auth) · Resend · Vercel
- **Design e plano:** `docs/superpowers/specs/` e `docs/superpowers/plans/`

## Rodando localmente

```bash
npm install
npm run dev
```

Sem variáveis de ambiente o site roda com o conteúdo de exemplo (`src/content/seed.ts`). O admin precisa do Supabase configurado.

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento em http://localhost:3000 |
| `npm test` | testes unitários (Vitest) |
| `npm run e2e` | testes end-to-end (Playwright) |
| `npm run lint` | ESLint |
| `npm run check:model` | valida `public/models/desk.glb` (nós obrigatórios e tamanho ≤ 3 MB) |

## Configuração (uma vez)

Copie `.env.example` para `.env.local` e preencha conforme os passos abaixo.

### 1. Supabase (plano gratuito)

1. Crie um projeto em https://supabase.com.
2. Em **SQL Editor**, rode o conteúdo de `supabase/migrations/0001_init.sql`. Ele cria as tabelas `content` e `projects`, as policies de leitura pública e os buckets `cv` e `images`.
3. Em **Project Settings → API**, copie:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (**segredo**: nunca exponha no navegador)

### 2. Login do admin com GitHub

1. No GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App**.
   - Homepage URL: a URL do site (ex.: `https://seu-portfolio.vercel.app`)
   - Authorization callback URL: `https://<seu-projeto>.supabase.co/auth/v1/callback`
2. No Supabase: **Authentication → Providers → GitHub**, ative e cole o Client ID e o Client Secret.
3. No Supabase: **Authentication → URL Configuration**:
   - Site URL: a URL do site
   - Redirect URLs: `http://localhost:3000/admin/auth/callback` e `https://<seu-site>/admin/auth/callback`
4. `ADMIN_GITHUB_ID` = o **id numérico** da sua conta GitHub (`gh api users/Luz-Lucas --jq .id` → `185098481`). Só essa identidade entra; o nome de usuário não é usado porque pode ser alterado.
5. Depois do seu primeiro login, desative **Authentication → Sign In / Providers → Allow new users to sign up** no Supabase, para ninguém mais criar conta.

### 3. Projetos do GitHub

- `GITHUB_USERNAME` = o seu usuário (padrão: `Luz-Lucas`; o nome antigo `NEXT_PUBLIC_GITHUB_USERNAME` também vale).
- `GITHUB_TOKEN` = um token *fine-grained* com acesso somente leitura a repositórios públicos (**Settings → Developer settings → Personal access tokens**). Ele aumenta o limite da API.

### 4. Formulário de contato

Por padrão o formulário usa o **FormSubmit** (`formsubmit.co/ajax/<e-mail>`), o mesmo do portfólio anterior: não precisa de chave. As mensagens vão para `contato.lucaspmluz@hotmail.com`; na primeira mensagem o FormSubmit manda um e-mail de ativação para esse endereço, e é só confirmar.

- `CONTACT_TO_EMAIL` = e-mail que recebe as mensagens (padrão: o e-mail do Contato).
- Opcional: `RESEND_API_KEY` troca o envio para o Resend (remetente `onboarding@resend.dev`; sem domínio verificado, o Resend só entrega para o e-mail da própria conta).

### 5. Cron e URL do site

- `CRON_SECRET` = uma string aleatória longa. A Vercel envia esse valor ao chamar `/api/keepalive` diariamente, o que mantém o Supabase gratuito ativo.
- `NEXT_PUBLIC_SITE_URL` = a URL pública do site (usada nos metadados e no Open Graph).

## Deploy na Vercel

1. Suba o repositório para o GitHub.
2. Na Vercel: **Add New → Project**, importe o repositório.
3. Em **Environment Variables**, adicione todas as variáveis do `.env.example`.
4. Faça o deploy. O cron de `vercel.json` é registrado automaticamente.
5. Atualize as URLs do GitHub OAuth App e do Supabase (passo 2) com o domínio `*.vercel.app` final.

## Usando o admin

Acesse `/admin` e entre com o GitHub.

- **Textos:** Leia-me, Sobre mim (com foto) e Contato.
- **Projetos:** marque quais repositórios aparecem, ordene e personalize descrição, demo e capa. "Atualizar do GitHub" busca repositórios novos.
- **Currículo:** envie um PDF (até 4 MB). Ele substitui o anterior.
- **Skills / Experiência:** listas editáveis.

Ao salvar, o site é atualizado em segundos.

## Cena 3D

O arquivo fonte fica em `C:\Users\ONLY\Documents\Craft Claude\Portifolio-3d\desk.blend`. Para regenerar o modelo:

1. No Blender, exporte como glTF Binary (`.glb`) com câmeras, texturas baked e `+Y up`.
2. Otimize:
   ```bash
   npx gltf-transform optimize desk-raw.glb public/models/desk.glb --compress draco --texture-compress webp --texture-size 2048
   ```
3. Valide com `npm run check:model`.

Nós obrigatórios no `.glb`: `Screen` (tela do CRT), `PowerLED`, `CamStart` e `CamEnd` (câmeras).
