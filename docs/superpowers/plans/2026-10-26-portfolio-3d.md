# Portfólio 3D (Win95) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portfólio na Vercel: cena 3D de uma escrivaninha anos 90 feita no Blender, em que o CRT liga e mostra uma área de trabalho Win95 com apps de competências, e com um admin para editar conteúdo, curar projetos do GitHub e trocar o currículo.

**Architecture:** Next.js (App Router) serve a página pública e o `/admin`. A cena é um `.glb` exportado do Blender e renderizado com React Three Fiber, com câmera fixa. A área de trabalho é HTML/CSS posicionado sobre o retângulo projetado da malha `Screen`. O conteúdo vem do Supabase (Postgres + Storage), e os projetos vêm da API do GitHub mesclados com a curadoria salva no Supabase. A página é cacheada e revalidada sob demanda quando o admin salva.

**Tech Stack:** Node 22, Next.js 15, React 19, TypeScript, three + @react-three/fiber 9 + @react-three/drei 10, zustand 5, zod 3, 98.css, @supabase/supabase-js + @supabase/ssr, resend, Vitest + Testing Library, Playwright, @gltf-transform/cli, Blender (via MCP `blender`).

**Spec:** `docs/superpowers/specs/2026-10-26-portfolio-3d-design.md` (referências em `docs/references/`)

**Ordem das fases:** cada fase entrega software funcionando.
1. **Fundação e área de trabalho** (Tasks 1–9): o site roda localmente, com conteúdo de exemplo, em modo 2D.
2. **Cena 3D** (Tasks 10–17): Blender → `.glb` → intro e tela.
3. **Admin e dados** (Tasks 18–23): Supabase, GitHub e painel.
4. **Publicação** (Tasks 24–25).

## Global Constraints

- Todo texto de interface em **português (pt-BR)**. Sem i18n.
- Ícones **fixos**, nesta ordem: Leia-me.txt, Sobre mim, Projetos, Skills, Experiência, Currículo.pdf, Contato, Prompt de comando, Lixeira.
- **Um clique** abre um app (não duplo-clique).
- Intro total **≤ 4 s**, pulável por clique ou qualquer tecla. Após a primeira visita, a intro é pulada (chave `localStorage` `p3d:intro-seen`). Com `prefers-reduced-motion: reduce`, a cena aparece já na posição final, sem dolly e sem flicker.
- **Leia-me.txt** abre sozinho apenas na primeira visita.
- `.glb` + texturas **≤ 3 MB** no total; 60 fps num notebook comum.
- Câmera **fixa** depois da intro: sem orbit, sem drag e sem parallax.
- Largura **< 768 px** ou WebGL indisponível → modo mobile: sem WebGL. A imagem da cena aparece só no loading; depois, a área de trabalho em tela cheia, sem dolly e sem efeito CRT, com janelas em tela cheia uma por vez e sem arrastar.
- Arquivos do Blender (`.blend`, renders) em `C:\Users\ONLY\Documents\Craft Claude\Portifolio-3d\`. Só o `.glb` final e as imagens exportadas entram em `public/`.
- Nomes obrigatórios no `.glb`: `Screen` (malha da tela), `PowerLED` (malha do LED), `CamStart` e `CamEnd` (câmeras).
- Admin liberado **somente** para o login GitHub em `ADMIN_GITHUB_LOGIN`.
- Planos gratuitos. Contato via Resend com remetente `onboarding@resend.dev`, enviado para `CONTACT_TO_EMAIL`. Cron diário de keep-alive do Supabase.
- Variáveis de ambiente: `GITHUB_USERNAME`, `GITHUB_TOKEN`, `ADMIN_GITHUB_LOGIN`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL`.
- Assets de terceiros apenas CC0 ou com licença clara (ícones, texturas, props).

## Review Focus

1. **Abrir um app já aberto** → foca e restaura a janela existente, sem duplicar (teste na Task 3).
2. **Janela arrastada para fora ou viewport redimensionado** → a barra de título continua alcançável (posição limitada à área de trabalho) (teste na Task 4).
3. **API do GitHub falha ou atinge limite** → o site renderiza e a janela Projetos mostra uma mensagem amigável, sem quebrar a página (teste na Task 19).
4. **Repositório curado foi apagado/renomeado no GitHub** → some da lista pública e aparece marcado como "não encontrado" no admin (teste nas Tasks 19 e 22).
5. **Upload inválido no admin** (currículo que não é PDF ou > 5 MB; capa/foto que não é imagem ou > 2 MB) → rejeitado com mensagem, sem substituir o arquivo atual (teste na Task 23).

---

## Estrutura de arquivos

```
src/
  app/
    page.tsx                      # página pública: escolhe modo cena/mobile
    layout.tsx                    # metadados, fontes, 98.css
    api/contact/route.ts          # POST formulário de contato
    api/keepalive/route.ts        # cron Supabase
    admin/
      layout.tsx                  # exige admin
      page.tsx                    # painel (abas)
      login/page.tsx
      auth/callback/route.ts
      actions.ts                  # server actions de escrita
      ContentForms.tsx, ProjectsForm.tsx, CvForm.tsx
  content/
    types.ts                      # SiteContent, Project, etc.
    seed.ts                       # conteúdo de exemplo
    apps.ts                       # registro fixo dos 9 apps
  lib/
    content.ts                    # getSiteContent()
    github.ts                     # fetchPublicRepos()
    projects.ts                   # mergeProjects(), getProjects()
    supabase/server.ts, admin.ts  # clientes
    auth.ts                       # requireAdmin(), isAdminLogin()
    uploads.ts                    # validateUpload()
    terminal.ts                   # runCommand()
    contact.ts                    # contactSchema, rateLimit()
  desktop/
    windowStore.ts                # zustand: gerenciador de janelas
    Desktop.tsx, Window.tsx, Taskbar.tsx, StartMenu.tsx, DesktopIcon.tsx
    useDrag.ts, clamp.ts
    apps/ Readme.tsx About.tsx Projects.tsx Skills.tsx Experience.tsx
          CvViewer.tsx Contact.tsx Terminal.tsx Trash.tsx
    desktop.css                   # overrides do 98.css + efeito CRT
  scene/
    Scene.tsx                     # Canvas R3F, carrega o glb
    intro.ts                      # introReducer
    useIntro.ts
    screenRect.ts                 # projectScreenRect()
    ScreenOverlay.tsx             # posiciona/escala a área de trabalho
    BootScreen.tsx, PowerOnEffect.tsx, LoadingScreen.tsx
    useDeviceMode.ts
supabase/migrations/0001_init.sql
scripts/check-model.mjs
public/models/desk.glb, public/images/loading.webp, public/images/og.png
tests/ (vitest: espelha src/) · e2e/ (playwright)
vercel.json · .env.example · README.md
```

---

## Fase 1 — Fundação e área de trabalho

### Task 1: Scaffold do projeto

**Files:**
- Create: projeto Next.js na raiz (`package.json`, `tsconfig.json`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`), `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `.env.example`, `e2e/smoke.spec.ts`

**Interfaces:**
- Produces: scripts `npm run dev | build | test | e2e | lint`. Alias `@/` → `src/`.

- [ ] **Step 1:** `git init` na raiz (a pasta já contém `docs/`). Rodar `npx create-next-app@15 . --ts --app --src-dir --eslint --no-tailwind --import-alias "@/*"` (manter `docs/`).
- [ ] **Step 2:** Instalar dependências: `three @react-three/fiber @react-three/drei zustand zod 98.css @supabase/supabase-js @supabase/ssr resend` e dev `vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @playwright/test @types/three @gltf-transform/cli`.
- [ ] **Step 3:** Configurar Vitest (jsdom, setup com jest-dom, alias `@`), Playwright (`webServer: npm run dev`, projetos `desktop` 1440×900 e `mobile` iPhone 13).
- [ ] **Step 4: Teste e2e de fumaça** em `e2e/smoke.spec.ts`: `GET /` responde 200 e `<html lang="pt-BR">`.
- [ ] **Step 5:** `layout.tsx` com `lang="pt-BR"`, importa `98.css`. Rodar `npm run e2e -- smoke`, que deve passar. `.env.example` com todas as variáveis da Global Constraints.
- [ ] **Step 6: Commit** `chore: scaffold next.js project`

### Task 2: Tipos de conteúdo, seed e registro de apps

**Files:**
- Create: `src/content/types.ts`, `src/content/seed.ts`, `src/content/apps.ts`, `src/lib/content.ts`
- Test: `tests/content/apps.test.ts`

**Interfaces:**
- Produces:
```ts
type SkillGroup = { group: string; items: { name: string; level: 1|2|3|4|5; years?: number }[] };
type ExperienceItem = { kind: 'job'|'education'; title: string; org: string; start: string; end: string|null; description: string };
type SiteContent = {
  readme: { body: string };                       // markdown simples
  about: { name: string; role: string; bio: string; location: string; availability: string; photoUrl: string|null };
  contact: { email: string; linkedin: string; github: string };
  skills: SkillGroup[];
  experience: ExperienceItem[];
  cvUrl: string|null;
};
type Project = { repoId: number; name: string; description: string; url: string; demoUrl: string|null;
                 coverUrl: string|null; languages: string[]; stars: number; updatedAt: string };
type AppId = 'readme'|'about'|'projects'|'skills'|'experience'|'cv'|'contact'|'terminal'|'trash';
type AppDef = { id: AppId; title: string; icon: string; defaultSize: { w: number; h: number } };
const APPS: readonly AppDef[];
getSiteContent(): Promise<SiteContent>   // nesta fase retorna seed; Task 18 troca a fonte
```

- [ ] **Step 1: Teste** `apps.test.ts`: `APPS.map(a => a.title)` igual a `['Leia-me.txt','Sobre mim','Projetos','Skills','Experiência','Currículo.pdf','Contato','Prompt de comando','Lixeira']`, e os ids são únicos.
- [ ] **Step 2:** Rodar `npm test -- apps`, que deve falhar.
- [ ] **Step 3:** Implementar tipos, `APPS` (ícones Win95 CC0 em `public/icons/*.png`, 32×32), seed com texto de exemplo plausível (em pt-BR, marcado "[exemplo]") e 3 projetos de exemplo em `seed.ts` (`SEED_CONTENT`, `SEED_PROJECTS`).
- [ ] **Step 4:** Rodar os testes, que devem passar.
- [ ] **Step 5: Commit** `feat: content types, seed and app registry`

### Task 3: Gerenciador de janelas

**Files:**
- Create: `src/desktop/windowStore.ts`
- Test: `tests/desktop/windowStore.test.ts`

**Interfaces:**
- Consumes: `AppId`, `APPS` (Task 2)
- Produces:
```ts
type WinState = { id: AppId; x: number; y: number; w: number; h: number; z: number; minimized: boolean; maximized: boolean };
useWindowStore: { windows: WinState[]; focusedId: AppId|null;
  open(id: AppId): void; close(id): void; focus(id): void; minimize(id): void;
  toggleMaximize(id): void; move(id, x: number, y: number): void; reset(): void }
```
A id da janela é o próprio `AppId` (uma janela por app).

- [ ] **Step 1: Testes:**
  - `open('about')` adiciona uma janela focada, com `z` maior que as demais.
  - **(Review Focus 1)** `open('about')` duas vezes → `windows.length === 1`. Se estava minimizada, `minimized === false`, e ela fica focada.
  - `close` remove a janela e o foco passa para a de maior `z` restante (ou `null`).
  - `minimize` → `minimized: true` e o foco sai dela.
  - Janelas novas abrem em cascata (cada uma com +24 px em x/y em relação à anterior).
- [ ] **Step 2:** Rodar os testes, que devem falhar.
- [ ] **Step 3:** Implementar com zustand (sem persistência).
- [ ] **Step 4:** Rodar os testes, que devem passar.
- [ ] **Step 5: Commit** `feat: window manager store`

### Task 4: Componente Window (barra de título, botões, arrastar)

**Files:**
- Create: `src/desktop/Window.tsx`, `src/desktop/useDrag.ts`, `src/desktop/clamp.ts`, `src/desktop/desktop.css`
- Test: `tests/desktop/clamp.test.ts`, `tests/desktop/Window.test.tsx`

**Interfaces:**
- Consumes: `useWindowStore` (Task 3)
- Produces: `clampPosition(pos: {x,y}, win: {w,h}, bounds: {w,h}): {x,y}`; `<Window id title draggable={boolean}>{children}</Window>`.

- [ ] **Step 1: Testes:**
  - **(Review Focus 2)** `clampPosition({x:-500,y:-50},{w:300,h:200},{w:800,h:600})` → `y >= 0` e pelo menos 64 px da barra de título visíveis horizontalmente (`x >= -300+64`). `{x:2000,y:2000}` → `x <= 800-64` e `y <= 600-28` (a barra de título de 28 px fica visível).
  - Clicar em "×" chama `close`, em "_" chama `minimize` e em "□" chama `toggleMaximize`. `mousedown` na janela chama `focus`.
  - Com `draggable={false}`, arrastar a barra não altera `x/y`.
- [ ] **Step 2:** Rodar os testes, que devem falhar.
- [ ] **Step 3:** Implementar com as classes `window`/`title-bar` do 98.css. O drag usa pointer events e `setPointerCapture` e chama `clampPosition` a cada movimento. A janela maximizada ocupa toda a área acima da taskbar. Os botões têm `aria-label` em pt-BR ("Fechar", "Minimizar", "Maximizar"). Ao redimensionar a área de trabalho, re-clampar todas as janelas.
- [ ] **Step 4:** Rodar os testes, que devem passar.
- [ ] **Step 5: Commit** `feat: draggable win95 window`

### Task 5: Shell da área de trabalho (ícones, taskbar, Iniciar, relógio)

**Files:**
- Create: `src/desktop/Desktop.tsx`, `src/desktop/DesktopIcon.tsx`, `src/desktop/Taskbar.tsx`, `src/desktop/StartMenu.tsx`
- Modify: `src/app/page.tsx` (renderiza `<Desktop>` em tela cheia nesta fase)
- Test: `tests/desktop/Desktop.test.tsx`

**Interfaces:**
- Consumes: `APPS`, `useWindowStore`, `<Window>`, `SiteContent`, `Project[]`
- Produces: `<Desktop content={SiteContent} projects={Project[] | {error: string}} mode={'scene'|'mobile'} />`. A área de trabalho preenche 100% do seu container (quem dimensiona é o pai).

- [ ] **Step 1: Testes:**
  - Renderiza os 9 ícones na ordem de `APPS`, como `button`s com nome acessível igual ao título.
  - **Um clique** em "Sobre mim" abre a janela "Sobre mim".
  - Cada janela aberta aparece como botão na taskbar. Clicar no botão de uma janela focada a minimiza; clicar no de uma minimizada a restaura.
  - O botão "Iniciar" abre um menu com os 9 apps, e escolher um item abre o app e fecha o menu. `Escape` fecha o menu.
  - Primeira visita (sem a chave `localStorage` `p3d:readme-seen`): o Leia-me abre sozinho e a chave é gravada. Com a chave presente, ele não abre.
  - O relógio mostra `HH:MM` no formato 24 h.
  - `mode="mobile"`: as janelas abrem maximizadas, abrir outro app minimiza o anterior (uma janela visível por vez) e as janelas não são arrastáveis.
- [ ] **Step 2:** Rodar os testes, que devem falhar.
- [ ] **Step 3:** Implementar. Os ícones ficam em grade vertical à esquerda, e o fundo é o teal Win95 `#008080`. Ícones e itens do menu são navegáveis por Tab e ativados com Enter/Espaço. Todo acesso a `localStorage` fica em try/catch.
- [ ] **Step 4:** Rodar os testes e `npm run dev` (ver a área de trabalho na tela cheia). Os testes devem passar.
- [ ] **Step 5: Commit** `feat: desktop shell with icons, taskbar and start menu`

### Task 6: Apps de conteúdo (Leia-me, Sobre mim, Skills, Experiência, Currículo, Lixeira)

**Files:**
- Create: `src/desktop/apps/{Readme,About,Skills,Experience,CvViewer,Trash}.tsx`, `src/desktop/apps/index.tsx` (mapa `AppId → componente`)
- Test: `tests/desktop/apps/contentApps.test.tsx`

**Interfaces:**
- Consumes: `SiteContent`
- Produces: `renderApp(id: AppId, data: { content: SiteContent; projects: Project[] | {error: string} }): ReactNode`

- [ ] **Step 1: Testes** (com `SEED_CONTENT`):
  - Readme renderiza `content.readme.body` (parágrafos e links).
  - About mostra nome, cargo, localização e disponibilidade. Sem `photoUrl`, mostra um avatar placeholder.
  - Skills agrupa por `group` e mostra o nível como 5 blocos (preenchidos = `level`), com texto acessível "nível 3 de 5".
  - Experience lista os itens com `end === null` como "Atual", primeiro os empregos e depois a formação, cada grupo do mais recente para o mais antigo.
  - CvViewer com `cvUrl` mostra um `<iframe>` do PDF e um link "Baixar" com o atributo `download`. Sem `cvUrl`, mostra "Currículo em breve".
  - Trash mostra o conteúdo fixo (2–3 itens bem-humorados de "projetos abandonados").
- [ ] **Step 2:** Rodar os testes, que devem falhar.
- [ ] **Step 3:** Implementar. Para o markdown do Leia-me/bio, usar um parser mínimo próprio (parágrafos, `**negrito**`, links `[t](url)`) sem `dangerouslySetInnerHTML`. Os links externos usam `target="_blank" rel="noopener"`.
- [ ] **Step 4:** Rodar os testes, que devem passar.
- [ ] **Step 5: Commit** `feat: content apps`

### Task 7: App Projetos (estilo Windows Explorer)

**Files:**
- Create: `src/desktop/apps/Projects.tsx`
- Test: `tests/desktop/apps/Projects.test.tsx`

**Interfaces:**
- Consumes: `Project[] | { error: string }`

- [ ] **Step 1: Testes:**
  - Lista os projetos como itens de "pasta" (ícone + nome) na ordem recebida.
  - Clicar num projeto mostra o painel de detalhes: descrição, linguagens, estrelas, link "Ver no GitHub" e link "Demo" (este só se houver `demoUrl`) e a capa (só se houver `coverUrl`). O botão "Voltar" retorna à lista.
  - Com `{error}`, mostra "Não foi possível carregar os projetos agora." e um link para o perfil do GitHub (`content.contact.github`).
  - Lista vazia → "Nenhum projeto publicado ainda."
- [ ] **Step 2:** Rodar os testes, que devem falhar.
- [ ] **Step 3:** Implementar com uma barra de endereço falsa (`C:\Projetos\<nome>`) e uma barra de status com a contagem de itens.
- [ ] **Step 4:** Rodar os testes, que devem passar.
- [ ] **Step 5: Commit** `feat: projects explorer app`

### Task 8: Prompt de comando

**Files:**
- Create: `src/lib/terminal.ts`, `src/desktop/apps/Terminal.tsx`
- Test: `tests/lib/terminal.test.ts`, `tests/desktop/apps/Terminal.test.tsx`

**Interfaces:**
- Produces: `runCommand(input: string, ctx: { content: SiteContent; projects: Project[] }): { output: string[]; action?: { open: AppId } | 'clear' }`

- [ ] **Step 1: Testes:**
  - `help` lista: `help, whoami, skills, projetos, experiencia, contato, curriculo, abrir <app>, cls`.
  - `whoami` → primeira linha `"<name> — <role>"`.
  - `skills` → uma linha por grupo: `"Frontend: React, TypeScript"`.
  - `projetos` → uma linha por projeto com nome e URL.
  - `abrir sobre` → `action: {open:'about'}`. Os nomes aceitos (sem acento, case-insensitive) são `leia-me, sobre, projetos, skills, experiencia, curriculo, contato, lixeira`.
  - `cls` → `action:'clear'`.
  - Comando desconhecido → `"'xyz' não é reconhecido como um comando interno. Digite help."`. Entrada vazia → `output: []`.
- [ ] **Step 2:** Rodar os testes, que devem falhar.
- [ ] **Step 3:** Implementar `runCommand` puro e o componente: fundo preto, prompt `C:\>`, histórico com ↑/↓ e foco automático no input. Disparar `open` via `useWindowStore`.
- [ ] **Step 4:** Rodar os testes, que devem passar.
- [ ] **Step 5: Commit** `feat: command prompt easter egg`

### Task 9: Contato (app + API)

**Files:**
- Create: `src/lib/contact.ts`, `src/app/api/contact/route.ts`, `src/desktop/apps/Contact.tsx`
- Test: `tests/lib/contact.test.ts`, `tests/api/contact.test.ts`

**Interfaces:**
- Produces: `contactSchema` (zod: `name` 2–80, `email` válido, `message` 10–2000, `website` honeypot opcional); `rateLimit(ip: string, now: number): boolean` (máx. 3 envios por IP a cada 10 min, Map em memória, best-effort por instância); `POST /api/contact` → `200 {ok:true}` | `400 {error}` | `429 {error}`.

- [ ] **Step 1: Testes:**
  - O schema rejeita e-mail inválido e mensagem com menos de 10 caracteres.
  - `rateLimit`: o 4º envio do mesmo IP em 10 min retorna `false`, e depois de 10 min volta a `true`.
  - A rota com honeypot preenchido retorna `200 {ok:true}` **sem** chamar o Resend (mock).
  - A rota com dados válidos chama `resend.emails.send` com `from: 'Portfólio <onboarding@resend.dev>'`, `to: CONTACT_TO_EMAIL` e `replyTo` igual ao e-mail do visitante.
  - O app mostra os links (e-mail `mailto:`, LinkedIn, GitHub) e o formulário. Após um envio ok, mostra "Mensagem enviada!". Com erro 429, mostra "Muitas mensagens, tente mais tarde."
- [ ] **Step 2:** Rodar os testes, que devem falhar.
- [ ] **Step 3:** Implementar. O campo honeypot fica escondido visualmente (`aria-hidden`, fora do fluxo de Tab).
- [ ] **Step 4:** Rodar os testes, que devem passar.
- [ ] **Step 5: Commit** `feat: contact app and api`

---

## Fase 2 — Cena 3D

> As Tasks 10–14 rodam no Blender via MCP `blender` (`execute_blender_code`, `render_viewport_to_path`). O Blender precisa estar aberto. Escala em metros: mesa ~1.4 × 0.7 m, tampo a 0.75 m; monitor CRT ~0.38 m de largura. Referências: `docs/references/ref1-computador.png` (forma do PC) e `ref2-composicao.png` (composição e clima; **sem** a caixa do Win95). Salvar sempre como `C:\Users\ONLY\Documents\Craft Claude\Portifolio-3d\desk.blend`.

### Task 10: Blockout, câmeras e verificação de nomes

**Files:**
- Create: `desk.blend` (pasta Craft Claude), `C:\Users\ONLY\Documents\Craft Claude\Portifolio-3d\check_names.py`

**Interfaces:**
- Produces: coleções `Computer`, `Desk`, `Room`, `Props`, `Lights`. Objetos `Screen`, `PowerLED`, `CamStart`, `CamEnd`. `CamEnd` é a posição final (frontal; a tela ocupa ≥ 65% da altura num quadro 16:9). `CamStart` fica ~10–15% mais afastada no mesmo eixo, com o mesmo FOV.

- [ ] **Step 1:** Escrever `check_names.py`, que retorna um dict `{missing: [...]}` para os nomes obrigatórios e confere que `Screen` é uma malha plana separada com UVs 0–1 cobrindo a área visível da tela.
- [ ] **Step 2:** Rodá-lo na cena vazia. Esperado: os 4 nomes em `missing`.
- [ ] **Step 3:** Fazer o blockout com primitivas na composição da ref. 2: parede, estante à direita/fundo, mesa, CRT sobre gabinete horizontal, teclado, mouse+mousepad, luminária no canto superior esquerdo, disquetes e CDs à esquerda e uma caneca no lugar da caixa. Criar `CamStart`/`CamEnd`.
- [ ] **Step 4:** Rodar `check_names.py`. Esperado: `missing: []`. Renderizar o viewport de `CamStart` e de `CamEnd` em PNG na pasta Craft Claude.
- [ ] **Step 5:** Salvar o `.blend`.

### Task 11: Modelagem do computador

**Files:** `desk.blend`

- [ ] **Step 1:** Monitor CRT: moldura grossa com cantos arredondados, tela levemente convexa (`Screen` separada, com bisel recuado), traseira do tubo afunilada com ventilação, base giratória, botões frontais e `PowerLED` (malha pequena separada).
- [ ] **Step 2:** Gabinete horizontal: drive de disquete 3.5", drive de CD, botão de energia, grade de ventilação e adesivo/logo genérico (sem marca real).
- [ ] **Step 3:** Teclado mecânico bege com teclas individuais (instanciadas, low-poly com bevel), mouse bege com fio e cabos com curvas (curve → mesh).
- [ ] **Step 4:** Rodar `check_names.py`, que deve dar `missing: []`. Renderizar de `CamEnd` e comparar com a ref. 1 (proporções do monitor/gabinete).
- [ ] **Step 5:** Salvar.

### Task 12: Ambiente, props e materiais

**Files:** `desk.blend`

- [ ] **Step 1:** Mesa com tampo e bordas chanfradas, parede, estante com livros (variações de cor/altura; modelos CC0 permitidos), luminária articulada de metal, disquetes, CDs (material iridescente leve), caneca e mousepad.
- [ ] **Step 2:** Materiais PBR: plástico bege amarelado fosco (base ~`#D9CFB4`, roughness ~0.55), madeira com veios (textura CC0 Poly Haven), metal escovado da luminária e parede escura. `Screen` desligada: vidro escuro `#1a1f1c` com leve reflexo.
- [ ] **Step 3:** Contar os triângulos da cena. Alvo ≤ 150k.
- [ ] **Step 4:** Salvar.

### Task 13: Iluminação, bake e checkpoint visual

**Files:** `desk.blend`; renders `checkpoint-start.png`, `checkpoint-end.png` (pasta Craft Claude)

- [ ] **Step 1:** Luz principal quente (área/spot na cúpula da luminária, ~2700 K), fill ambiente muito fraco, brilho azulado vindo da tela (área no plano da tela, ~6500 K, baixa intensidade) e clima escuro e aconchegante como a ref. 2.
- [ ] **Step 2:** Render Cycles de `CamStart` e `CamEnd` (1920×1080), com leve DOF na estante.
- [ ] **Step 3: CHECKPOINT** — mostrar os dois renders ao dono e **aguardar aprovação** antes de seguir. Ajustar até aprovar.
- [ ] **Step 4:** Bake: UV2 de lightmap para objetos estáticos (atlas em poucas texturas de 2048), bake combinado (difuso + AO + sombras) para `baseColor` sem luz dinâmica. `Screen` e `PowerLED` **não** recebem bake (ficam com material próprio).
- [ ] **Step 5:** Salvar.

### Task 14: Export do `.glb` e imagens

**Files:**
- Create: `public/models/desk.glb`, `public/images/loading.webp` (1920×1080, render de `CamEnd`), `public/images/loading-mobile.webp` (1080×1920, crop vertical), `public/images/og.png` (1200×630), `scripts/check-model.mjs`

**Interfaces:**
- Produces: `desk.glb` com câmeras e os nós `Screen`, `PowerLED`, `CamStart`, `CamEnd`. `npm run check:model` sai com 0 se ok.

- [ ] **Step 1:** Escrever `scripts/check-model.mjs` com `@gltf-transform/core`. Ele falha se faltar algum nó obrigatório, se `CamStart`/`CamEnd` não forem câmeras ou se o arquivo passar de 3 MB. Adicionar o script `check:model`.
- [ ] **Step 2:** Rodar sem o arquivo. Esperado: falha "desk.glb não encontrado".
- [ ] **Step 3:** Exportar o glTF Binary (com câmeras, materiais com texturas baked e `+Y up`) para a pasta Craft Claude e otimizar com `gltf-transform` (`draco` + texturas `webp`, máx. 2048) para `public/models/desk.glb`. Exportar as imagens a partir dos renders aprovados.
- [ ] **Step 4:** Rodar `npm run check:model`, que deve passar e mostrar o tamanho final.
- [ ] **Step 5: Commit** `feat: export 3d scene model and images`

### Task 15: Cena no React Three Fiber + modo do dispositivo

**Files:**
- Create: `src/scene/Scene.tsx`, `src/scene/useDeviceMode.ts`
- Modify: `src/app/page.tsx`
- Test: `tests/scene/useDeviceMode.test.ts`

**Interfaces:**
- Produces: `useDeviceMode(): 'scene' | 'mobile' | null` (`null` até medir); `<Scene introPhase={IntroPhase /* tipo definido em src/scene/intro.ts, criado já aqui com o union da Task 16 */} onReady={() => void} onScreenMesh={(mesh, camera) => void} />`. A câmera interpola de `CamStart` para `CamEnd` conforme `introPhase` (Task 16).

- [ ] **Step 1: Testes** de `useDeviceMode`: largura 767 → `'mobile'`; largura 1280 com WebGL → `'scene'`; largura 1280 sem WebGL (`getContext('webgl2')` e `('webgl')` retornam null) → `'mobile'`.
- [ ] **Step 2:** Rodar os testes, que devem falhar.
- [ ] **Step 3:** Implementar. `Scene` carrega `/models/desk.glb` com `useGLTF` (Draco decoder do drei) e usa a câmera do `.glb` como câmera ativa, sem `OrbitControls`. O `Screen` usa um `MeshStandardMaterial` cujo `emissive` vai de 0 (desligado) a ~1.2 (ligado), e o `PowerLED` acende em verde junto. Uma `pointLight` azulada fraca na frente da tela acompanha a mesma intensidade. Usar `dpr={[1, 2]}`. `page.tsx` usa `next/dynamic` com `ssr:false` para a cena, e no modo `'mobile'` não importa nada de three.
- [ ] **Step 4:** Rodar os testes e `npm run dev`: a cena aparece no desktop e não é carregada no mobile (conferir na aba de rede que `desk.glb` não é baixado com viewport 375 px).
- [ ] **Step 5: Commit** `feat: render baked scene with r3f`

### Task 16: Máquina de estados da intro

**Files:**
- Create: `src/scene/intro.ts`, `src/scene/useIntro.ts`, `src/scene/LoadingScreen.tsx`, `src/scene/PowerOnEffect.tsx`, `src/scene/BootScreen.tsx`
- Test: `tests/scene/intro.test.ts`, `e2e/intro.spec.ts`

**Interfaces:**
- Produces:
```ts
type IntroPhase = 'loading'|'dolly'|'poweron'|'boot'|'desktop';
type IntroEvent = { type: 'loaded' } | { type: 'tick'; elapsedMs: number } | { type: 'skip' };
introReducer(state: { phase: IntroPhase; startedAt: number|null; instant: boolean }, ev: IntroEvent): typeof state
INTRO_TIMINGS = { dolly: 1600, poweron: 700, boot: 1200 } // total 3500 ms ≤ 4 s
useIntro(): { phase: IntroPhase; progress: number /*0..1 na fase atual*/; skip(): void; markLoaded(): void }
```

- [ ] **Step 1: Testes** de `introReducer`:
  - `loading` + `loaded` → `dolly` (ou direto `desktop` se `instant`).
  - Com `tick`, a fase avança conforme `INTRO_TIMINGS`. Em `elapsedMs = 3500`, a fase é `desktop`.
  - `skip` em qualquer fase após `loaded` → `desktop`. `skip` durante `loading` → marca `instant`, e ao chegar `loaded` vai direto para `desktop`.
  - A soma de `INTRO_TIMINGS` é ≤ 4000.
- [ ] **Step 2:** Rodar os testes, que devem falhar.
- [ ] **Step 3:** Implementar. `instant = true` se `localStorage['p3d:intro-seen']` existe ou se `prefers-reduced-motion: reduce`. Ao chegar em `desktop`, gravar `p3d:intro-seen`. `skip` é disparado por `pointerdown`/`keydown` na janela. O `LoadingScreen` mostra `loading.webp` (`loading-mobile.webp` em retrato) com texto estilo BIOS e progresso do `useProgress` do drei. O `PowerOnEffect` é uma linha horizontal branca que se abre num clarão (CSS, 700 ms). O `BootScreen` mostra o logo "Iniciando..." genérico (sem logo da Microsoft) com barra animada. No modo mobile, usar o mesmo `LoadingScreen` e ir direto para `desktop` (sem dolly/poweron/boot).
- [ ] **Step 4: e2e** `intro.spec.ts` (projeto desktop): a primeira visita mostra a área de trabalho em ≤ 5 s. Clicar durante o dolly → a área de trabalho aparece imediatamente. Num segundo carregamento, a área de trabalho já aparece sem a fase `dolly` (expor `data-intro-phase` no `<main>`). Com `reducedMotion: 'reduce'` → nunca passa por `dolly`.
- [ ] **Step 5:** Rodar os testes e o e2e, que devem passar.
- [ ] **Step 6: Commit** `feat: skippable intro sequence`

### Task 17: Área de trabalho dentro do monitor + maximizar

**Files:**
- Create: `src/scene/screenRect.ts`, `src/scene/ScreenOverlay.tsx`
- Modify: `src/desktop/desktop.css` (efeito CRT), `src/app/page.tsx`
- Test: `tests/scene/screenRect.test.ts`, `e2e/desktop.spec.ts`

**Interfaces:**
- Consumes: `onScreenMesh(mesh, camera)` (Task 15), `<Desktop>` (Task 5), `IntroPhase` (Task 16)
- Produces: `projectScreenRect(mesh: THREE.Mesh, camera: THREE.Camera, viewport: {w,h}): {left: number; top: number; width: number; height: number}`; `DESKTOP_LOGICAL = { w: 800, h: 600 }`.

- [ ] **Step 1: Testes** de `projectScreenRect`: um plano 4×3 em z=0, com câmera perspectiva a z=5 olhando a origem e viewport 1600×900, gera um retângulo centrado (`left + width/2 ≈ 800`, `top + height/2 ≈ 450`) com proporção 4:3 (±1%). Mover o plano para +x desloca `left` para a direita.
- [ ] **Step 2:** Rodar os testes, que devem falhar.
- [ ] **Step 3:** Implementar. Projetar os 8 cantos do bounding box de `Screen` com a câmera **na pose `CamEnd`** e usar o retângulo envolvente. O `ScreenOverlay` posiciona um container absoluto nesse retângulo e renderiza o `<Desktop>` num palco lógico de 800×600, escalado com `transform: scale(rect.height/600)` (`transform-origin: top left`). O overlay só fica visível nas fases `boot` e `desktop`, e o `BootScreen` também é renderizado dentro dele. Recalcular no `resize`. Efeito CRT por cima (`pointer-events: none`): scanlines (gradiente repetido, opacidade ≤ 0.08), vinheta radial e leve `border-radius` para simular a curvatura. **Maximizar:** um botão fixo no canto superior direito da página ("Tela cheia" / "Voltar ao monitor"), que muda o overlay para `position: fixed; inset: 0` sem escala (palco = viewport) e sem efeito CRT.
- [ ] **Step 4: e2e** `desktop.spec.ts` (desktop, intro já vista): o retângulo do overlay ocupa ≥ 60% da altura da viewport 1440×900. Clicar em "Projetos" abre a janela. "Tela cheia" faz o overlay ocupar a viewport inteira. Screenshot de referência salvo em `e2e/__screenshots__`.
- [ ] **Step 5:** Rodar os testes e o e2e, que devem passar. Conferir à mão que o texto fica nítido e alinhado com a moldura do CRT em 1366×768, 1920×1080 e 2560×1440.
- [ ] **Step 6: Commit** `feat: desktop overlay inside crt screen`

---

## Fase 3 — Admin e dados

> Pré-requisitos que **o dono** faz (credenciais são dele): criar o projeto Supabase (free); habilitar o provedor GitHub no Supabase Auth com um GitHub OAuth App (callback do Supabase); criar um token GitHub fine-grained só de leitura de repositórios públicos; criar a chave Resend; preencher `.env.local`. O plano fornece o passo a passo em `README.md` (Task 24).

### Task 18: Schema Supabase e leitura do conteúdo

**Files:**
- Create: `supabase/migrations/0001_init.sql`, `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`
- Modify: `src/lib/content.ts`, `src/app/page.tsx`
- Test: `tests/lib/content.test.ts`

**Interfaces:**
- Produces:
  - Tabelas: `content(key text primary key, value jsonb not null, updated_at timestamptz default now())` com keys `readme | about | contact | skills | experience | cv`; `projects(repo_id bigint primary key, visible boolean not null default false, sort int not null default 0, description text, demo_url text, cover_url text)`.
  - RLS: `select` público em ambas; nenhuma policy de escrita (as escritas usam a service role no servidor, depois de `requireAdmin`).
  - Buckets públicos: `cv`, `images`.
  - `getSiteContent(): Promise<SiteContent>`, cacheado com `unstable_cache` e tag `'content'`. A seed SQL insere o `SEED_CONTENT`.
  - `createServerClient()` (anon, cookies) e `createAdminClient()` (service role, **apenas** em código de servidor: `import 'server-only'`).

- [ ] **Step 1: Testes** (Supabase mockado):
  - Linhas `content` → `SiteContent` montado (`cv.value.url` → `cvUrl`).
  - Key faltando → usa o valor de `SEED_CONTENT` daquela seção.
  - Erro do Supabase → `getSiteContent` **lança** (não retorna conteúdo vazio), para o Next manter servindo a última página gerada com sucesso.
  - Sem as variáveis `NEXT_PUBLIC_SUPABASE_*` (dev local) → retorna `SEED_CONTENT` sem chamar a rede.
- [ ] **Step 2:** Rodar os testes, que devem falhar.
- [ ] **Step 3:** Escrever a migration e implementar. Em `page.tsx`: `export const revalidate = 3600` e buscar conteúdo e projetos em paralelo.
- [ ] **Step 4:** Rodar os testes, que devem passar. Aplicar a migration no projeto do dono (SQL editor ou `npx supabase db push`) e ver o conteúdo seed na página.
- [ ] **Step 5: Commit** `feat: supabase schema and content loading`

### Task 19: Projetos do GitHub + curadoria

**Files:**
- Create: `src/lib/github.ts`, `src/lib/projects.ts`
- Test: `tests/lib/projects.test.ts`, `tests/lib/github.test.ts`

**Interfaces:**
- Produces:
```ts
type GithubRepo = { id: number; name: string; description: string|null; html_url: string; homepage: string|null;
                    language: string|null; topics: string[]; stargazers_count: number; fork: boolean; archived: boolean; pushed_at: string };
type ProjectRow = { repo_id: number; visible: boolean; sort: number; description: string|null; demo_url: string|null; cover_url: string|null };
fetchPublicRepos(username: string): Promise<GithubRepo[]>   // fetch com token, next: { tags: ['github'], revalidate: 3600 }, paginação per_page=100
mergeProjects(repos: GithubRepo[], rows: ProjectRow[]): Project[]
getProjects(): Promise<Project[] | { error: string }>       // tag 'projects'
```

- [ ] **Step 1: Testes:**
  - `mergeProjects` retorna só as linhas `visible`, ordenadas por `sort` crescente.
  - A descrição/demo da linha sobrescrevem as do repo quando não nulas. Sem demo na linha, usa o `homepage` do repo se houver.
  - `languages` = `[repo.language, ...repo.topics]` sem nulos e sem duplicatas.
  - **(Review Focus 4)** Uma linha cujo `repo_id` não existe mais em `repos` é omitida sem lançar erro.
  - **(Review Focus 3)** `getProjects` com `fetchPublicRepos` lançando (403 rate limit ou rede) → retorna `{ error: 'github_unavailable' }`. A página continua renderizando (teste de componente: Desktop recebe `{error}` e a janela Projetos mostra a mensagem amigável da Task 7).
  - `fetchPublicRepos` segue a paginação até uma página com menos de 100 itens e envia `Authorization: Bearer <GITHUB_TOKEN>`.
- [ ] **Step 2:** Rodar os testes, que devem falhar.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** Rodar os testes, que devem passar.
- [ ] **Step 5: Commit** `feat: github projects with curation merge`

### Task 20: Autenticação do admin

**Files:**
- Create: `src/lib/auth.ts`, `src/app/admin/login/page.tsx`, `src/app/admin/auth/callback/route.ts`, `src/app/admin/layout.tsx`, `src/middleware.ts`
- Test: `tests/lib/auth.test.ts`, `e2e/admin-auth.spec.ts`

**Interfaces:**
- Produces: `isAdminLogin(user: { user_metadata?: { user_name?: string } } | null): boolean` (comparação case-insensitive com `ADMIN_GITHUB_LOGIN`); `requireAdmin(): Promise<User>`, que redireciona para `/admin/login` se não houver sessão e retorna 403 se o login for outro.

- [ ] **Step 1: Testes:** `isAdminLogin` → true para o login igual (com outra caixa), false para outro login, `null` ou metadata ausente. Com `ADMIN_GITHUB_LOGIN` vazio → sempre false.
- [ ] **Step 2:** Rodar os testes, que devem falhar.
- [ ] **Step 3:** Implementar. O login usa o botão "Entrar com GitHub" (`signInWithOAuth({provider:'github', options:{redirectTo: SITE_URL + '/admin/auth/callback'}})`). O callback troca o code pela sessão. Um usuário logado que não é admin faz `signOut` e vê "Acesso restrito." O middleware renova a sessão via `@supabase/ssr` só em `/admin/*`. Toda server action chama `requireAdmin()` como primeira linha.
- [ ] **Step 4: e2e:** `/admin` sem sessão redireciona para `/admin/login`.
- [ ] **Step 5:** Rodar os testes, que devem passar. Teste manual de login com a conta do dono.
- [ ] **Step 6: Commit** `feat: github-only admin auth`

### Task 21: Editores de conteúdo

**Files:**
- Create: `src/app/admin/page.tsx` (abas: Textos, Skills, Experiência, Projetos, Currículo), `src/app/admin/actions.ts`, `src/app/admin/ContentForms.tsx`
- Test: `tests/admin/actions.test.ts`

**Interfaces:**
- Consumes: `requireAdmin`, `createAdminClient`, os tipos de `SiteContent`
- Produces: `saveContent(key: 'readme'|'about'|'contact'|'skills'|'experience', value: unknown): Promise<{ ok: true } | { ok: false; error: string }>`, que valida com zod por key, faz `upsert` e `revalidateTag('content')`.

- [ ] **Step 1: Testes:**
  - Sem admin → `requireAdmin` lança e nada é gravado.
  - `about` sem `name` → `{ok:false, error}` em pt-BR. `contact.linkedin` que não é URL → erro.
  - `skills` com `level` 6 → erro.
  - Com valor válido, chama `upsert` e `revalidateTag('content')`.
- [ ] **Step 2:** Rodar os testes, que devem falhar.
- [ ] **Step 3:** Implementar os formulários: textareas para Leia-me e bio; campos para os dados de Sobre e Contato (a foto entra como campo de URL; o widget de upload vem na Task 23); listas editáveis (adicionar, remover, reordenar com ↑/↓) para os grupos e itens de skills e para a experiência. Mostrar "Salvo" / o erro inline.
- [ ] **Step 4:** Rodar os testes, que devem passar. Teste manual: editar a bio, salvar e ver a mudança em `/` em segundos.
- [ ] **Step 5: Commit** `feat: admin content editors`

### Task 22: Curadoria de projetos no admin

**Files:**
- Create: `src/app/admin/ProjectsForm.tsx`
- Modify: `src/app/admin/actions.ts`
- Test: `tests/admin/projectsActions.test.ts`

**Interfaces:**
- Produces: `saveProjects(rows: ProjectRow[]): Promise<{ok:true}|{ok:false;error:string}>`, que faz upsert de todas as linhas, define `sort` pelo índice e chama `revalidateTag('projects')`; `refreshGithub(): Promise<void>`, que chama `revalidateTag('github')`; `listAdminProjects(): Promise<Array<{ repo: GithubRepo | null; row: ProjectRow | null }>>`.

- [ ] **Step 1: Testes:**
  - `listAdminProjects` traz todos os repos (forks e arquivados com marcação) mesclados com as linhas. **(Review Focus 4)** Uma linha sem repo correspondente vem com `repo: null` (a UI mostra "não encontrado no GitHub" com botão remover).
  - `saveProjects` grava `sort` = posição na lista enviada. `demo_url` inválida → erro.
- [ ] **Step 2:** Rodar os testes, que devem falhar.
- [ ] **Step 3:** Implementar a UI: tabela com checkbox "Exibir", ↑/↓ para ordenar (os visíveis no topo), campos de descrição personalizada, demo e capa (URL; o upload vem na Task 23), e os botões "Atualizar do GitHub" e "Salvar".
- [ ] **Step 4:** Rodar os testes, que devem passar.
- [ ] **Step 5: Commit** `feat: admin project curation`

### Task 23: Uploads (currículo, foto, capas)

**Files:**
- Create: `src/lib/uploads.ts`, `src/app/admin/CvForm.tsx`
- Modify: `src/app/admin/actions.ts`
- Test: `tests/lib/uploads.test.ts`

**Interfaces:**
- Produces: `validateUpload(file: { type: string; size: number }, kind: 'cv'|'image'): { ok: true } | { ok: false; error: string }`; `uploadCv(form: FormData)`, que envia para o bucket `cv` em `curriculo-<timestamp>.pdf`, grava `content.cv = {url}`, apaga o PDF anterior **depois** de gravar o novo e chama `revalidateTag('content')`; `uploadImage(form: FormData, purpose: 'photo'|'cover'): Promise<{ok:true; url:string}|{ok:false;error:string}>`.

- [ ] **Step 1: Testes (Review Focus 5):**
  - `cv`: `application/pdf` com 4 MB → ok; `image/png` → "O currículo precisa ser um PDF."; PDF com 6 MB → "Arquivo maior que 5 MB."
  - `image`: `image/webp` com 1 MB → ok; `application/pdf` → erro; 3 MB → "Imagem maior que 2 MB."
  - `uploadCv` com arquivo inválido não chama o storage e mantém `content.cv` intacto. Se o upload falhar, não grava `content.cv` nem apaga o anterior.
- [ ] **Step 2:** Rodar os testes, que devem falhar.
- [ ] **Step 3:** Implementar, validando também o tipo pelo magic number (`%PDF`, assinaturas PNG/JPEG/WebP), e não só o `type`. O `CvForm` mostra o link do PDF atual, o input de arquivo e "Enviar". Adicionar um botão "Enviar imagem" ao campo de foto (Task 21) e ao de capa (Task 22), que preenche a URL com o retorno de `uploadImage`.
- [ ] **Step 4:** Rodar os testes, que devem passar. Teste manual: trocar o currículo e abrir "Currículo.pdf" no site.
- [ ] **Step 5: Commit** `feat: validated uploads for cv and images`

---

## Fase 4 — Publicação

### Task 24: SEO, keep-alive, config da Vercel e README

**Files:**
- Create: `src/app/api/keepalive/route.ts`, `vercel.json`, `README.md`
- Modify: `src/app/layout.tsx` (metadata)
- Test: `tests/api/keepalive.test.ts`

**Interfaces:**
- Produces: `GET /api/keepalive`, que exige `Authorization: Bearer <CRON_SECRET>` (401 caso contrário), faz `select key from content limit 1` e retorna `200 {ok:true}`. `vercel.json`: `{"crons":[{"path":"/api/keepalive","schedule":"0 9 * * *"}]}`.

- [ ] **Step 1: Testes:** sem header → 401; com secret correto → consulta o Supabase (mock) → 200.
- [ ] **Step 2:** Rodar os testes, que devem falhar.
- [ ] **Step 3:** Implementar. Metadata: `title` "<nome> — Portfólio", `description` a partir de `about.role`, Open Graph/Twitter com `/images/og.png` e `metadataBase` = `NEXT_PUBLIC_SITE_URL`. Incluir um bloco `<noscript>`/conteúdo SSR com nome, cargo, bio e links, para crawlers e leitores de tela. `README.md` com o passo a passo do dono: criar o Supabase, rodar a migration, criar os buckets, criar o OAuth App do GitHub (URLs de callback), o token GitHub, a chave Resend, as variáveis na Vercel, e como regenerar o `.glb` (`npm run check:model`).
- [ ] **Step 4:** Rodar os testes, que devem passar.
- [ ] **Step 5: Commit** `feat: seo, keepalive cron and setup docs`

### Task 25: Verificação final e deploy

- [ ] **Step 1:** `npm run lint && npm test && npm run build && npm run e2e`. Todos devem passar.
- [ ] **Step 2:** Lighthouse (mobile) em `npm run start`: Performance ≥ 85, Acessibilidade ≥ 90. Desktop: a intro chega em `desktop` em ≤ 4 s após o load do `.glb`.
- [ ] **Step 3:** Conferir à mão cada item da Global Constraints (ícones na ordem, clique único, intro pulável, reduced-motion, mobile sem `desk.glb` na rede, admin recusando outra conta).
- [ ] **Step 4:** Com o OK do dono: criar o repositório GitHub público, fazer push, importar na Vercel, configurar as variáveis e fazer o deploy. Ajustar `NEXT_PUBLIC_SITE_URL` e as URLs de callback do OAuth para o domínio `*.vercel.app`.
- [ ] **Step 5:** Smoke test em produção: carregar `/`, abrir cada app, enviar uma mensagem de contato de teste para o próprio e-mail, logar no `/admin`, alterar um texto e ver a mudança refletida.
