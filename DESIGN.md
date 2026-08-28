---
name: Economize
description: Interface financeira clara e consciente para registrar, entender e controlar gastos.
colors:
  canvas: "oklch(98.415% 0.00341 247.858)"
  surface: "oklch(98.415% 0.00341 247.858)"
  surface-muted: "oklch(96.826% 0.00685 247.896)"
  foreground: "oklch(20.768% 0.03982 265.755)"
  muted: "oklch(44.553% 0.03745 257.281)"
  subtle: "oklch(44.553% 0.03745 257.281)"
  border: "oklch(92.876% 0.01262 255.508)"
  border-strong: "oklch(86.898% 0.01985 252.894)"
  brand: "oklch(51.094% 0.08606 186.391)"
  brand-hover: "oklch(43.697% 0.07052 188.216)"
  brand-pressed: "oklch(38.606% 0.05902 188.416)"
  brand-soft: "oklch(98.358% 0.0142 180.72)"
  brand-foreground: "oklch(98.415% 0.00341 247.858)"
  danger: "oklch(50.542% 0.19049 27.518)"
  danger-soft: "oklch(97.053% 0.01295 17.38)"
  success: "oklch(52.73% 0.1371 150.069)"
  success-soft: "oklch(98.193% 0.01806 155.826)"
  warning: "oklch(55.528% 0.14551 48.998)"
  warning-soft: "oklch(98.688% 0.0214 95.277)"
typography:
  display:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3333
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geist Sans, Geist, Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Geist Sans, Geist, Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist Sans, Geist, Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4286
  meta:
    fontFamily: "Geist Mono, SFMono-Regular, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.01em"
rounded:
  xs: "5px"
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "14px"
  card: "16px"
  dialog: "18px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "40px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.brand-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 18px"
    height: "46px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 18px"
    height: "46px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 18px"
    height: "46px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.brand}"
    typography: "{typography.label}"
    rounded: "4px"
    padding: "0"
    height: "20px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.card}"
    padding: "18px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0 14px"
    height: "48px"
  nav-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 12px"
    height: "44px"
---

# Design System: Economize

## Overview

**Creative North Star: "Clareza serena"**

O Economize trata a vida financeira como algo que merece atenção, não alarme. A interface combina a precisão de um painel operacional com uma atmosfera leve: o fundo quase branco, a grade vertical discreta e as camadas translúcidas organizam a informação sem competir com ela. O teal funciona como uma assinatura de confiança e progresso, usado nos controles de ação, no estado ativo e nas barras de categoria.

A composição é compacta, escaneável e orientada à decisão cotidiana. Títulos em Literata dão personalidade editorial aos momentos de síntese — como “Agosto 2026” — enquanto Geist mantém filtros, valores e navegação diretos. No desktop, o resumo se apoia em uma coluna de filtros persistente e uma área principal modular; no mobile, a mesma hierarquia se reorganiza sem perder o contexto.

**Key Characteristics:**

- Clareza serena, com contraste suficiente e pouca ornamentação.
- Camadas suaves: canvas, superfícies, bordas e sombra ambientam a informação.
- Teal semântico para ação, seleção e evolução; vermelho e verde para leitura financeira.
- Densidade funcional, com respiro consistente e conteúdo priorizado.

## Colors

A paleta é fria e quase neutra, com slate para estrutura e teal para orientar a atenção. Os valores acima representam o tema claro observado nas telas; o sistema também possui aliases equivalentes para o tema escuro.

### Primary

- **Teal de orientação** (`{colors.brand}`): ação primária, foco, marca, barras de categoria e navegação ativa.
- **Teal de interação** (`{colors.brand-hover}` / `{colors.brand-pressed}`): hover e pressionamento, com aprofundamento progressivo.

### Neutral

- **Canvas claro** (`{colors.canvas}`): fundo geral da aplicação e base da grade ambiental.
- **Superfície clara** (`{colors.surface}`): cartões, controles e áreas elevadas.
- **Superfície mutada** (`{colors.surface-muted}`): cabeçalhos de cartões, hover e preenchimentos auxiliares.
- **Texto principal** (`{colors.foreground}`): títulos, conteúdo e valores financeiros.
- **Texto secundário** (`{colors.muted}`) e **texto sutil** (`{colors.subtle}`): descrições, metadados e labels de menor prioridade.
- **Borda** (`{colors.border}`) e **borda forte** (`{colors.border-strong}`): separação discreta e contornos de controle.

### Feedback

- **Vermelho de despesa** (`{colors.danger}` / `{colors.danger-soft}`): saídas e estados de erro.
- **Verde de receita** (`{colors.success}` / `{colors.success-soft}`): entradas e estados positivos.
- **Âmbar de atenção** (`{colors.warning}` / `{colors.warning-soft}`): avisos sem caráter destrutivo.

**The One Accent Rule.** O teal deve concentrar a atenção em ações, seleção, foco e dados de progresso; não deve virar uma pintura uniforme de toda a tela.

## Typography

**Display Font:** Literata (com Georgia como fallback)

**Body Font:** Geist Sans, Geist, Inter (com `system-ui`, `sans-serif` como fallback)

**Label/Mono Font:** Geist Mono para metadados compactos e dados técnicos.

**Character:** Literata traz uma voz editorial, humana e contemplativa para os títulos de síntese. Geist é neutra, legível e econômica para operações, formulários e números; a dupla separa personalidade de eficiência sem parecer decorativa.

### Hierarchy

- **Display** (600, `clamp(2rem, 4vw, 3rem)`, `1.1`): títulos de página, como mês e contexto do resumo.
- **Headline** (600, `1.5rem`, `1.3333`): títulos de seção com maior presença quando aplicável.
- **Title** (600, `1rem`, `1.5`): títulos compactos de filtros e controles.
- **Body** (400, `1rem`, `1.5`): texto corrido e descrições; manter linhas curtas em blocos auxiliares.
- **Label** (600, `0.875rem`, `1.4286`): botões, navegação e labels de campo.
- **Meta** (400, `0.8125rem`, `1.5`, tracking `-0.01em`): contagens, informações secundárias e números de apoio.

**The Two Voices Rule.** Use Literata para orientar e dar contexto; use Geist para executar, comparar e registrar. Não use a fonte display em inputs, botões ou labels operacionais.

## Layout

O shell privado ocupa no máximo `77.5rem` (`1240px`), centralizado, com bordas laterais sutis. O topo tem aproximadamente `18px 24px` de padding, borda inferior e efeito de vidro com blur; contém marca, navegação em cápsula e acesso à conta.

No desktop, `SummaryPage` usa uma grade de `18.25rem` para filtros e uma coluna flexível para o conteúdo. O filtro permanece sticky com margem de `24px`, enquanto a área principal usa `32px 28px 40px`. O resumo financeiro ocupa toda a largura da área principal; abaixo dele, categorias e últimos movimentos formam duas colunas com gap de `16px`.

Os espaçamentos seguem uma cadência curta de `4 / 8 / 16 / 24 / 32px`, com agrupamentos de formulário em torno de `22px`. Cartões usam padding de `18px` ou `16px`, e listas usam separações pequenas para manter a leitura densa sem colar os itens.

Em telas até `60rem`, o link “Minha conta” é ocultado para preservar espaço. Até `48rem`, o shell perde bordas laterais, o topo vira uma grade de duas linhas, a navegação passa a ocupar toda a largura com rolagem horizontal e os filtros deixam de ser persistentes: ficam escondidos até “Filtros” ser acionado. A grade de conteúdo passa a uma coluna. Até `28rem`, ícones da navegação são removidos, ações viram uma pequena grade e itens de movimento empilham texto e status.

## Elevation & Depth

A profundidade é híbrida, porém contida. A maior parte da estrutura vem de tonal layering: canvas, superfícies translúcidas, gradientes verticais muito suaves e bordas slate. Sombras são ambientais, nunca dramáticas: cartões usam `var(--shadow-card)` (`0 1px 2px rgb(15 23 42 / 0.04), 0 8px 24px rgb(15 23 42 / 0.04)`), popovers usam `var(--shadow-popover)` e diálogos usam `var(--shadow-dialog)`. A grade de fundo e o glow teal são atmosfera, não textura protagonista.

**The Quiet Surface Rule.** Superfícies devem parecer próximas do canvas, com separação dada por tonalidade, borda e sombra baixa. Reserve sombras maiores para conteúdo que realmente flutua, como popovers e diálogos.

## Shapes

O vocabulário combina retângulos suavemente arredondados com cápsulas sem raio intermediário. Cartões e painéis usam `16px`; o formulário principal usa `18px`; controles de input usam `12px`; a marca usa `10px`; botões usam `10px`; estados de status, filtros ativos e navegação usam `999px`. Checkboxes têm cantos pequenos de aproximadamente `5px`.

Contornos são finos (`1px`) e de baixo contraste. Campos têm fundo claro levemente gradiente, enquanto cartões usam gradiente vertical translúcido. O sistema evita linhas pesadas e usa divisores apenas quando ajudam a separar o cabeçalho do corpo, como no ledger.

## Components

### Buttons

- **Shape:** controles compactos, com raio suave de `10px`, altura de `36px`, `46px` ou `48px` conforme o tamanho; o tamanho `sm` usa padding horizontal de `14px`, `md` de `18px` e `lg` de `22px`.
- **Primary:** teal de marca com texto claro; é a ação afirmativa de formulários e filtros.
- **Secondary:** superfície clara, texto principal e borda; para ações disponíveis sem prioridade dominante.
- **Ghost:** fundo transparente, texto secundário; recebe superfície mutada e texto principal no hover.
- **Danger:** vermelho semântico para ações destrutivas, mantendo a mesma geometria do primário.
- **Link:** sem preenchimento ou borda, texto teal e sublinhado no hover; usado para “Ver todas” e alternância pública.
- **Hover / pressed / focus:** hover aprofunda a cor ou adiciona superfície; pressed aprofunda mais. `:focus-visible` usa contorno de `2px` com offset e a cor semântica do controle.
- **Pending / disabled:** cursor de espera ou bloqueado, spinner quando pendente e opacidade reduzida para aproximadamente `42%`; movimento do spinner é removido com `prefers-reduced-motion`.

### Chips

- **Style:** cápsulas de `999px`, borda slate fina, superfície translúcida e texto secundário; padding aproximado de `6px 10px`.
- **State:** aparecem no mobile para os filtros ativos, com a informação em português (“Mês: Agosto 2026”, “Todas as contas”); não substituem o painel de filtros.

### Cards / Containers

- **Corner Style:** `16px` para cartões de resumo, categorias e movimentos; `18px` para o painel de autenticação.
- **Background:** gradiente vertical entre superfície e canvas, com mistura translúcida.
- **Shadow Strategy:** sombra baixa e ampla de cartão; cabeçalhos podem ter superfície mutada e divisor inferior.
- **Border:** `1px` em borda neutra; borda forte apenas para divisores, foco ou empty states tracejados.
- **Internal Padding:** `16px` no resumo financeiro e `18px` nos cartões de conteúdo.

### Inputs / Fields

- **Style:** campo de `48px` de altura, raio `12px`, borda de `1px`, padding horizontal de `14px`, ícones em slots de `18px` e fundo claro com gradiente discreto.
- **Focus:** borda e outline teal de `2px`, sem deslocar o layout; campos de filtro seguem o mesmo tratamento.
- **Error / Disabled:** erro usa vermelho semântico e mensagem reservada abaixo do campo; disabled usa superfície mutada, texto sutil e remove o foco visual.
- **Semantics:** labels ficam acima do controle, descrições abaixo da label e mensagens de validação associadas pelo componente acessível.

### Navigation

- **Private desktop:** topo com marca à esquerda, navegação central em cápsula e conta à direita. A navegação tem borda fina, padding de `4px` e links com altura mínima de `44px`.
- **Active:** fundo brand-soft, texto teal hover e ícone preenchido; o link ativo expõe `aria-current="page"`.
- **Mobile:** a marca ocupa a primeira linha e a navegação ocupa a largura completa em uma faixa horizontal rolável. Em larguras muito estreitas, os ícones são ocultados para preservar os rótulos.
- **Public:** cabeçalho simples com marca e link de alternância (“Entrar” / “Criar conta”), usando seta teal e layout centralizado no canvas.

### Summary Ledger

O ledger “Entradas e saídas” é o componente-síntese da área privada: cabeçalho com título, recolhimento e ajuda contextual; corpo com checkbox para saldo anterior, linhas alinhadas de saldo/entradas/saídas, divisor e saldo final destacado em Literata/Geist de grande escala. Despesas recebem vermelho; o saldo final mantém o texto principal para comunicar resultado, não alerta.

### Category Bars & Movement Status

As barras de despesas por categoria usam trilho mutado de `9px`, raio de cápsula e preenchimento teal. Movimentos recentes são itens com borda e raio de `14px`; o texto principal fica truncado em uma linha quando necessário. Status de receita e despesa são cápsulas com fundos suaves, bordas derivadas da cor semântica e valores no formato monetário brasileiro.

## Do's and Don'ts

### Do:

- **Do** mantenha toda a interface e a documentação de produto em português brasileiro.
- **Do** use `Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })` para valores monetários exibidos.
- **Do** preserve a distinção Literata para síntese e Geist para operação.
- **Do** use o teal para orientar ações, foco, seleção e progresso; use vermelho e verde apenas para semântica financeira e feedback.
- **Do** preserve a hierarquia desktop/mobile: filtros persistentes no desktop, painel acionável no mobile.
- **Do** mantenha foco visível, nomes acessíveis em controles icon-only, `aria-current` na navegação e mensagens de erro ligadas aos campos.
- **Do** respeite `prefers-reduced-motion` em transições, spinner e qualquer novo movimento.

### Don't:

- **Don't** transforme o canvas claro e silencioso em um fundo saturado, escuro ou cheio de textura.
- **Don't** use sombras profundas ou bordas de alto contraste como decoração; profundidade deve continuar ambiental.
- **Don't** aplique Literata a controles, inputs, tabelas ou metadados compactos.
- **Don't** use teal indiscriminadamente em texto, fundos e indicadores; sua raridade mantém a orientação clara.
- **Don't** esconda filtros ou informação essencial sem oferecer o acionador correspondente no mobile.
- **Don't** dependa apenas de cor para distinguir receita, despesa, erro ou estado ativo; preserve rótulos, ícones e contraste.
