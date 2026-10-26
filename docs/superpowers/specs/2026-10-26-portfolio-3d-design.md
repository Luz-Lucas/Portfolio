# Portfólio 3D — Computador anos 90 com Windows 95

Data: 2026-10-26 · Status: aprovado

## 1. Intenção

Portfólio pessoal de dev hospedado na Vercel. Ao abrir o site, o visitante vê uma cena 3D de uma escrivaninha noturna com um computador bege dos anos 90 e monitor de tubo (CRT). Conforme a página carrega, a câmera se aproxima levemente da tela, o computador liga e aparece uma área de trabalho estilo Windows 95. Cada ícone da área de trabalho é um "app" que abre uma janela interativa com uma parte do portfólio.

**Por quê:** destacar-se para recrutadores técnicos com algo memorável, sem sacrificar a rapidez com que eles precisam achar a informação.

**Público:** recrutadores com conhecimento de tecnologia. Eles abrem muitos portfólios, frequentemente no celular, e decidem em segundos.

## 2. Objetivos, não-objetivos, anti-objetivos

**Objetivos**
- Cena 3D bonita, no estilo "realista com estilo" da referência 2 (ver §3).
- Fácil e intuitivo: em menos de 5 s o visitante sabe quem é a pessoa e onde clicar.
- Projetos vindos direto do GitHub, com curadoria pelo admin.
- Textos, links, currículo (PDF) e projetos editáveis numa área de admin, sem novo deploy.
- Deploy na Vercel.

**Não-objetivos (por enquanto)**
- Criar ou remover ícones pelo admin. O conjunto de ícones é fixo e só o conteúdo é editável.
- Versão em inglês. O site é só em português.
- Simular o Windows 95 de verdade (menus profundos, sistema de arquivos etc.).

**Anti-objetivos (seria fracasso mesmo funcionando)**
- Intro longa ou impossível de pular.
- Site pesado ou lento para abrir, principalmente no celular.
- Interface "fiel demais" que atrapalhe o uso (por exemplo, exigir duplo-clique).
- Texto borrado ou ilegível dentro da tela.

## 3. Cena 3D

### Referências
Imagens em `docs/references/`.
- **Referência 1** (`ref1-computador.png`, low-poly, PC bege): define o *objeto* computador. Gabinete horizontal sob o monitor, monitor CRT bege com botões frontais, cabo, mouse bege.
- **Referência 2** (`ref2-composicao.png`, escrivaninha noturna): define a *composição e o clima*. Ignorar a caixa/placa do Windows 95.

### Conteúdo da cena
- **Parede** escura ao fundo e **estante** de livros (desfocada, à direita/fundo).
- **Mesa** de madeira com veios.
- **Computador:** monitor CRT bege (tela levemente curva, moldura grossa, botões e LED de energia) sobre gabinete horizontal (drive de disquete e CD, entradas de ventilação).
- **Teclado** bege mecânico, **mouse** bege com fio e **mousepad**.
- **Luminária** de braço articulado no canto superior esquerdo, principal fonte de luz quente.
- **Props:** pilha de disquetes, CDs espalhados e um objeto no lugar da caixa do Win95 (caneca ou porta-lápis, escolha do builder).

### Estilo e luz
- Materiais PBR realistas: plástico bege levemente amarelado e fosco, madeira, metal da luminária.
- Clima escuro e aconchegante. A luz quente da luminária contrasta com o brilho frio da tela ligada.
- Iluminação **baked** no Blender (lightmaps/texturas com sombras e AO), para ficar bonito e leve no navegador. Luz dinâmica só para o brilho da tela (emissivo + leve luz azulada na mesa e no teclado quando liga).
- Profundidade de campo leve desfocando a estante (escolha minha; pode ser cortada se custar desempenho).

### Pipeline
- Modelagem no Blender via MCP. Computador, monitor, teclado, mouse, mesa e luminária são modelados no projeto. Texturas/materiais CC0 (ex.: Poly Haven) são permitidos, e props secundários do fundo (livros, CDs) podem usar modelos CC0 se economizar tempo (escolha minha).
- **Checkpoint visual:** antes de integrar ao site, renders da cena no enquadramento inicial e final são mostrados ao dono para aprovação (escolha minha).
- O arquivo fonte `.blend` e os renders ficam em `C:\Users\ONLY\Documents\Craft Claude\Portifolio-3d\`.
- Export `.glb` com compressão (Draco ou Meshopt) e texturas comprimidas (KTX2/WebP), copiado para o projeto web.
- **Orçamento:** `.glb` + texturas ≤ ~3 MB no total; a cena deve rodar a 60 fps num notebook comum.
- A malha da tela do monitor é um objeto separado e nomeado (ex.: `Screen`), para o código web saber onde fica a tela.

## 4. Sequência de abertura

Duração total ≤ 4 s, pulável a qualquer momento por clique ou tecla:

1. **Carregamento:** tela de loading simples (estilo BIOS/texto) enquanto o `.glb` baixa.
2. **Cena aparece** com o computador desligado. Enquanto isso, a câmera faz uma aproximação **leve** em direção à tela (dolly curto, com easing suave).
3. **Liga:** LED de energia acende, efeito clássico de CRT ligando (linha horizontal que se abre em clarão) e a tela clareia.
4. **Boot curto:** logo/tela de inicialização estilo Win95, ~1 s.
5. **Área de trabalho** aparece; a janela **Leia-me.txt** abre sozinha na primeira visita.

- **Câmera fixa** após a intro: sem orbitar, sem arrastar e sem parallax (escolha minha), para manter a interface nítida e evitar conflito com arrastar janelas.
- Em visitas seguintes (lembradas no navegador) a intro é pulada e o site vai direto para a área de trabalho com a câmera já na posição final.
- Com `prefers-reduced-motion`, não há dolly nem flicker: a cena aparece direto na posição final.
- **Enquadramento final:** a tela ocupa a maior parte da altura da janela no desktop (alvo ≥ ~65%), mantendo mesa e luminária visíveis nas bordas. Um botão de "maximizar" leva a área de trabalho para tela cheia (escolha minha), para quem quiser ler com conforto.

## 5. Área de trabalho (interface Win95)

### Princípios
- A interface é **HTML/CSS** sobreposta à tela 3D, e não uma textura renderizada: fica nítida, clicável, acessível e com texto selecionável. A técnica de alinhamento com a malha `Screen` fica a critério do builder (ver §9), mas o resultado precisa parecer *dentro* do monitor.
- Efeito CRT sutil sobre a interface (scanlines, leve vinheta/curvatura, brilho), que não pode prejudicar a leitura.
- Visual Win95 (cinza #C0C0C0, bordas em relevo, barra de título azul, fonte bitmap-like legível), usando uma biblioteca como `98.css`/`react95` ou CSS próprio, a critério do builder.
- **Usabilidade acima de fidelidade:** um clique abre o app, janelas arrastáveis, minimizar/maximizar/fechar, foco traz a janela para frente e cada janela aberta aparece na barra de tarefas.
- Barra de tarefas com botão **Iniciar** (menu com atalhos para os mesmos apps) e relógio.
- Navegável por teclado; janelas com rótulos acessíveis.

### Ícones (fixos)

| Ícone | Conteúdo | Fonte dos dados |
|---|---|---|
| **Leia-me.txt** | Quem é a pessoa em 2 linhas + dica de onde clicar. Abre sozinho na 1ª visita | Admin |
| **Sobre mim** | Foto, bio, localização, disponibilidade | Admin |
| **Projetos** | Janela estilo "Windows Explorer" com os repositórios selecionados; cada um abre detalhes (descrição, linguagens, estrelas, link GitHub, link demo, capa) | GitHub + Admin |
| **Skills** | Tecnologias agrupadas por área (Frontend, Backend, Ferramentas…) com nível ou tempo de uso | Admin |
| **Experiência** | Linha do tempo de empregos e formação | Admin |
| **Currículo.pdf** | Visualizador de PDF na janela + botão baixar | Admin (upload) |
| **Contato** | E-mail, LinkedIn, GitHub + formulário que envia e-mail | Admin (links) |
| **Prompt de comando** | Easter egg: `help`, `whoami`, `skills`, `projetos`, `contato`, `cls`… respondendo com os dados reais | Admin (reuso) |
| **Lixeira** | Easter egg leve (ex.: "projetos abandonados" ou piada) | Fixo no código |

### Celular (largura < 768 px)
- Sem cena 3D e sem WebGL. Uma imagem estática renderizada da cena aparece **só na tela de loading**.
- Depois do loading, a área de trabalho abre direto em tela cheia (sem dolly, sem efeito de ligar o CRT). As janelas abrem em tela cheia, uma por vez, e não há arrastar.

## 6. Área de admin

- Rota `/admin`, com interface simples e funcional (não precisa seguir o tema Win95).
- **Login:** GitHub OAuth, liberado **somente** para o usuário GitHub do dono (definido por variável de ambiente). Qualquer outra conta é recusada.
- **Projetos:** lista os repositórios públicos do usuário via API do GitHub. Para cada um: exibir sim/não, ordem (arrastar), e sobrescrever opcionalmente descrição, link de demo e imagem de capa (upload). Nome, linguagens, estrelas e URL vêm do GitHub.
- **Currículo:** upload de PDF que substitui o atual.
- **Textos e links:** editar o conteúdo de Leia-me, Sobre mim (incluindo foto), Skills, Experiência e Contato, além dos links sociais.
- Salvar reflete no site público em segundos, sem novo deploy (revalidação sob demanda).

## 7. Arquitetura (escolhas minhas)

- **Next.js** (App Router, TypeScript) hospedado na **Vercel**.
- **React Three Fiber + drei** para a cena; o `.glb` é carregado com `useGLTF`.
- **Supabase:** Postgres para conteúdo e seleção de projetos, Storage para PDF e imagens, Auth com provedor GitHub para o admin. RLS: leitura pública do conteúdo, escrita só para o dono.
- **GitHub API:** chamada no servidor com token (variável de ambiente), com cache e revalidação, para não depender do limite de requisições nem deixar o site lento.
- **Formulário de contato:** envio via Resend com o remetente sandbox (`onboarding@resend.dev`) para o e-mail do próprio dono, o que dispensa domínio verificado. Proteção básica contra spam (honeypot + limite por IP).
- **Custo:** tudo em planos gratuitos (escolha minha). Como o Supabase free pausa após ~1 semana sem uso, um Vercel Cron diário faz uma consulta leve para mantê-lo ativo. Sem domínio próprio por enquanto (usa `*.vercel.app`).
- **Variáveis de ambiente:** `GITHUB_USERNAME`, `GITHUB_TOKEN`, `ADMIN_GITHUB_LOGIN`, credenciais Supabase, `RESEND_API_KEY`, e-mail de destino do contato.

### Modelo de dados (indicativo)
- `content`: chave → JSON (leia-me, sobre, contato/links, lixeira se quiser).
- `skills`: grupo, nome, nível/tempo, ordem.
- `experience`: tipo (emprego/formação), título, organização, período, descrição, ordem.
- `projects`: `repo_id`, visível, ordem, descrição/demo/capa sobrescritas.
- Storage: `cv/curriculo.pdf`, `images/…`.

## 8. Qualidade

- Primeira tela útil (loading visível) imediata; área de trabalho utilizável em ≤ ~4 s numa conexão boa.
- Lighthouse razoável no celular (a versão mobile não carrega WebGL).
- Fallback: se WebGL falhar, usar o mesmo modo do celular.
- SEO básico: título, descrição, Open Graph com imagem renderizada da cena, e conteúdo textual acessível a crawlers.
- Código em repositório GitHub público (recrutadores técnicos vão olhar).

## 9. Deixado a critério do builder

- Técnica exata de sobrepor o HTML à malha `Screen` (drei `<Html transform>`, overlay projetado em espaço de tela ou outra), desde que o texto fique nítido e alinhado.
- Bibliotecas de UI Win95, de arrastar janelas e de visualização de PDF.
- Prop que substitui a caixa do Win95, detalhes da estante e quantidade de props.
- Conteúdo da Lixeira e comandos extras do Prompt.
- Ícones Win95 (usar pacotes livres ou desenhar próprios; evitar assets com direitos incertos).

## 10. Conteúdo inicial

O conteúdo real é preenchido pelo dono via admin. O projeto sobe com textos de exemplo (seed) para todas as seções.
