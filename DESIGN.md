---
name: Economize
description: "Caderno financeiro sereno para enxergar a distribuição dos gastos com clareza."
colors:
  verde-petroleo: "oklch(51.094% 0.08606 186.391)"
  verde-petroleo-hover: "oklch(43.697% 0.07052 188.216)"
  verde-petroleo-suave: "oklch(95.265% 0.0498 180.801)"
  fundo-ardosia: "oklch(96.826% 0.00685 247.896)"
  papel-frio: "oklch(98.415% 0.00341 247.858)"
  texto-ardosia: "oklch(20.768% 0.03982 265.755)"
  texto-secundario: "oklch(44.553% 0.03745 257.281)"
  texto-sutil: "oklch(55.439% 0.04072 257.417)"
  borda: "oklch(92.876% 0.01262 255.508)"
  borda-forte: "oklch(86.898% 0.01985 252.894)"
  perigo: "oklch(50.542% 0.19049 27.518)"
  perigo-suave: "oklch(97.053% 0.01295 17.38)"
  sucesso: "oklch(52.73% 0.1371 150.069)"
  sucesso-suave: "oklch(98.193% 0.01806 155.826)"
  aviso: "oklch(55.528% 0.14551 48.998)"
  aviso-suave: "oklch(98.688% 0.0214 95.277)"
typography:
  display:
    fontFamily: '"Literata", Georgia, serif'
    fontSize: "clamp(2.875rem, 5vw, 3.625rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  headline:
    fontFamily: '"Literata", Georgia, serif'
    fontSize: "clamp(2.375rem, 7vw, 3.625rem)"
    fontWeight: 600
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  title:
    fontFamily: '"Literata", Georgia, serif'
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.02em"
  body:
    fontFamily: '"Geist Sans", "Geist", Inter, system-ui, sans-serif'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: '"Geist Sans", "Geist", Inter, system-ui, sans-serif'
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4286
  mono:
    fontFamily: '"Geist Mono", "SFMono-Regular", Consolas, monospace'
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "-0.01em"
rounded:
  control: "10px"
  field: "12px"
  card: "24px"
  dialog: "18px"
  pill: "999px"
spacing:
  control-gap: "0.625rem"
  content-gap: "0.875rem"
  card-padding: "1.375rem"
  section-gap: "2rem"
  page-padding: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.verde-petroleo}"
    textColor: "{colors.papel-frio}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "2.875rem"
    padding: "0 1.125rem"
  button-secondary:
    backgroundColor: "{colors.papel-frio}"
    textColor: "{colors.texto-ardosia}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    height: "2.875rem"
    padding: "0 1.125rem"
  card-surface:
    backgroundColor: "{colors.papel-frio}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  text-field:
    backgroundColor: "{colors.papel-frio}"
    textColor: "{colors.texto-ardosia}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    height: "3rem"
  navigation-active:
    backgroundColor: "{colors.verde-petroleo-suave}"
    textColor: "{colors.verde-petroleo-hover}"
    rounded: "{rounded.pill}"
    padding: "0.375rem 0.75rem"
---

# Design System: Economize

## Overview

**Creative North Star: "Caderno financeiro sereno"**

O Economize deve parecer um lugar calmo para organizar a realidade financeira: papel frio, tinta escura e um verde-petróleo usado como marcação de orientação. A interface não transforma a vida financeira em espetáculo; ela cria uma superfície confiável para ler, registrar e comparar informações sem pressão.

A composição é mobile-first e orientada à tarefa. Tipografia editorial dá peso aos títulos, enquanto uma sans-serif precisa mantém formulários, tabelas e controles fáceis de escanear. A profundidade vem principalmente de camadas tonais e bordas finas; sombras aparecem somente quando uma superfície realmente precisa se destacar, como um modal ou popover.

A voz visual é serena e objetiva. Neon, gamificação agressiva e estética promocional de fintechs são anti-referências confirmadas.

**Key Characteristics:**

- Papel frio e superfícies tonais, com contraste confortável.
- Verde-petróleo reservado para orientação, seleção e ação primária.
- Literata nos títulos; Geist Sans nos controles e textos de leitura.
- Componentes refinados, contidos e responsivos desde o menor viewport.
- Profundidade em camadas, não em uma coleção de cartões flutuantes.

## Colors

A paleta combina o silêncio azulado do papel frio com um verde-petróleo de orientação. O acento é funcional: ele aponta para ações, estados selecionados e relações importantes, sem cobrir a tela.

### Primary

- **Verde-petróleo:** o acento de marca para ações primárias, foco, seleção e pequenos marcadores de orientação.
- **Verde-petróleo hover:** a versão mais profunda usada em hover, links ativos e estados pressionados.
- **Verde-petróleo suave:** o campo de apoio para seleção, chips, ícones contextuais e realces discretos.

### Neutral

- **Papel frio:** a superfície principal de cards, formulários e áreas de leitura.
- **Fundo ardósia:** o canvas geral da aplicação e a camada externa das superfícies.
- **Texto ardósia:** a tinta principal para títulos, valores e conteúdo prioritário.
- **Texto secundário:** a tinta de apoio para descrições e metadados legíveis.
- **Texto sutil:** a tinta de baixa ênfase para placeholders, datas e informações auxiliares.
- **Borda:** linhas de separação e contornos de baixa ênfase.
- **Borda forte:** contornos de hover, estados de filtro e divisórias que precisam de mais presença.

### Named Rules

**The Verde-Petróleo de Orientação Rule.** Use o acento para orientar uma decisão ou confirmar um estado; não use verde-petróleo como decoração de fundo ou preenchimento indiscriminado.

**The Papel Frio Rule.** Superfícies claras devem parecer papel frio e limpo, nunca branco estourado ou cinza sem vida.

## Typography

**Display Font:** Literata (com Georgia, serif como fallback)
**Body Font:** Geist Sans (com Geist, Inter e system-ui como fallbacks)
**Label/Mono Font:** Geist Mono para metadados, códigos e valores de apoio.

**Character:** Literata dá à interface uma voz editorial, pessoal e estável. Geist Sans reduz o esforço de leitura nos controles e mantém números, formulários e tabelas precisos.

### Hierarchy

- **Display** (semibold, `display`, line-height tight): títulos de entrada e mensagens de orientação com presença editorial.
- **Headline** (semibold, `headline`, line-height 0.98): títulos de página e entradas principais de cada área.
- **Title** (semibold, `title`): títulos de cards, modais e grupos de conteúdo.
- **Body** (regular, `body`): descrições e textos de leitura; mantenha a medida em aproximadamente 65–75ch quando o texto for longo.
- **Label** (semibold, `label`): nomes de campos, botões, status e ações.
- **Mono** (regular, `mono`): datas, filtros ativos, códigos e metadados compactos; não use como fantasia tecnológica.

### Named Rules

**The Two Voices Rule.** Literata conduz a hierarquia; Geist Sans conduz a operação. Não troque suas funções por conveniência.

**The Quiet Measure Rule.** Títulos podem ter personalidade, mas textos operacionais devem preservar leitura direta, altura de linha confortável e alinhamento previsível.

## Layout

O layout é mobile-first sempre. A composição começa em uma coluna com áreas confortáveis para toque e leitura; só depois se expande para duas colunas, barras de navegação mais largas e tabelas completas. O conteúdo principal usa um container central amplo, com margens laterais que se reduzem no mobile.

O ritmo combina grupos compactos dentro de um componente com separações generosas entre seções. Cards usam padding consistente e cabeçalhos alinhados ao conteúdo. Na navegação privada, o cabeçalho permanece no topo; em larguras menores, a navegação passa para uma segunda linha horizontalmente rolável. Resumos e filtros reorganizam-se em blocos; tabelas densas podem se tornar linhas empilhadas com rótulos auxiliares.

Pontos de mudança observados no código: a composição ampla começa em torno de `48rem`; formulários com duas colunas usam `sm`; cabeçalhos e ações passam a empilhar em larguras menores; elementos muito estreitos recebem ajustes adicionais até aproximadamente `28rem`.

**The Mobile-First Rule.** Toda nova tela deve funcionar primeiro em uma coluna estreita, sem depender de uma versão desktop para revelar a hierarquia ou completar uma tarefa.

## Elevation & Depth

O sistema usa profundidade em camadas. O canvas, as superfícies de papel e as superfícies suaves se separam por tonalidade, bordas finas e espaçamento. Cards comuns permanecem estáveis e silenciosos; sombras são reservadas para elementos que precisam flutuar sobre o fluxo, como diálogos, popovers e alguns nós interativos.

### Shadow Vocabulary

- **Ambient low:** sombra quase imperceptível para pequenos controles que precisam de separação mínima.
- **Card:** sombra suave e ampla para uma superfície que precisa subir apenas um pouco, sem parecer suspensa.
- **Popover:** sombra mais profunda para menus e superfícies temporárias acima do conteúdo.
- **Dialog:** sombra ampla para proteger o foco visual de uma confirmação ou edição modal.
- **Tree node:** sombra curta e estrutural para o estado de um item interativo na árvore de categorias.

### Named Rules

**The Layered Surface Rule.** Primeiro resolva hierarquia com papel, fundo, borda e espaço. Só depois considere sombra.

**The Quiet Elevation Rule.** Uma sombra deve explicar que uma superfície está acima do fluxo; não deve virar o elemento mais chamativo da tela.

## Shapes

A linguagem de formas é suavemente arredondada, com silhuetas estáveis e sem ornamentação. Controles de ação usam cantos menores; campos usam cantos um pouco mais confortáveis; cards e superfícies de conteúdo têm cantos amplos; chips e navegação selecionada usam cápsulas apenas quando representam uma opção compacta ou um estado.

Bordas são finas e funcionais. Elas separam camadas, ajudam a encontrar campos e tornam estados de filtro legíveis. Não use barras coloridas grossas nas laterais, molduras decorativas ou radii diferentes sem uma razão semântica.

## Components

### Buttons

- **Shape:** cantos firmes e suavemente arredondados, com `control` como referência.
- **Primary:** fundo verde-petróleo, texto papel frio, altura confortável e padding horizontal estável. Use para a ação principal visível.
- **Secondary:** superfície papel frio, texto ardósia e borda; use quando a ação é importante, mas não deve competir com a principal.
- **Ghost / Link:** fundo transparente, texto verde-petróleo e underline apenas em hover quando o controle se comporta como link.
- **Filter:** formato pill, superfície papel frio e estado selecionado em verde-petróleo suave.
- **Hover / Focus:** a mudança deve ser de tonalidade e contorno, com foco visível de alto contraste e sem deslocamentos bruscos.

### Page headings

- **Component:** `PageHeading` em `src/components/PageHeading.tsx`.
- **Use:** hierarquia principal das telas, com título, descrição e um texto auxiliar opcional já alinhados à escala editorial.
- **Composition:** mantenha o controle de ações no `header` pai; o componente cuida somente do agrupamento da leitura.

### Inline messages

- **Component:** `InlineMessage` em `src/components/InlineMessage.tsx`.
- **Use:** feedback de operações concluídas ou falhas recuperáveis em telas privadas e modais.
- **Tones:** `success` para confirmação e `danger` para erro; mensagens de erro recebem `role="alert"` e anúncio assertivo por padrão.
- **Semantics:** o componente usa um parágrafo com região viva; mantenha mensagens curtas e informe o problema ou o resultado com linguagem acionável.

### Filter chips

- **Component:** `FilterChip` em `src/components/FilterChip.tsx`.
- **Use:** exibir filtros aplicados como informação não interativa, inclusive quando a linha precisar quebrar no mobile.
- **Interaction:** para filtros que podem ser acionados ou alternados, use `Button` com `variant="filter"`.

### Chips

- **Style:** cápsulas pequenas, borda fina e texto secundário em repouso.
- **State:** seleção usa verde-petróleo suave e texto verde-petróleo hover; não dependa apenas da cor para comunicar a seleção.

### Cards / Containers

- **Corner Style:** cards de conteúdo usam o raio card; superfícies internas podem usar o raio field ou control quando representam um controle menor.
- **Background:** papel frio sobre fundo ardósia, com superfícies suaves para grupos secundários.
- **Shadow Strategy:** sem sombra por padrão; overlays e diálogos usam o vocabulário de elevação documentado acima.
- **Border:** borda fina para explicar a separação entre camadas.
- **Internal Padding:** use o padding de card; reduza no mobile quando a área de conteúdo exigir mais largura útil.

### Inputs / Fields

- **Style:** campo de 3rem de altura, superfície papel frio, borda fina, raio field e texto Geist Sans.
- **Focus:** borda verde-petróleo e outline visível; o foco deve permanecer perceptível em teclado e alto contraste.
- **Error / Disabled:** erro usa vermelho de validação e não apenas mudança de fundo; disabled reduz contraste sem remover a informação do rótulo.
- **Behavior:** mensagens de erro têm área reservada para evitar deslocamentos desnecessários no formulário.

### Navigation

- **Style:** cabeçalho com fundo translúcido de canvas e borda inferior; navegação privada usa um agrupamento pill.
- **Default:** texto secundário, baixo contraste relativo e leitura imediata.
- **Active:** fundo verde-petróleo suave, texto verde-petróleo hover e `aria-current` quando for uma rota.
- **Mobile:** a marca permanece identificável; a navegação passa para uma linha rolável sem comprimir os alvos.

### Dialogs

- **Surface:** papel frio com borda e sombra dialog, largura limitada e cantos dialog.
- **Overlay:** scrim escuro com blur de cabeçalho apenas quando necessário para proteger o foco.
- **Structure:** cabeçalho e ações permanecem estáveis; o corpo pode rolar sem mover o fechamento ou as ações principais.

### Transaction Rows

- **Style:** valores usam numerais tabulares; metadados podem usar mono; ícones são pequenos e funcionais.
- **Responsive:** em desktop, a linha aproveita a estrutura de tabela; no mobile, cada registro se torna um bloco legível com rótulos auxiliares.

## Do's and Don'ts

### Do:

- **Do** começar cada composição pelo mobile e expandir a hierarquia para telas maiores.
- **Do** usar verde-petróleo para orientar ação, foco e seleção, preservando sua raridade.
- **Do** usar Literata em títulos e Geist Sans em operações, formulários e tabelas.
- **Do** separar camadas com tonalidade, borda fina e espaçamento antes de aplicar sombra.
- **Do** manter foco visível, estados de erro legíveis e alvos de toque confortáveis.
- **Do** usar ícones vetoriais consistentes em vez de símbolos de texto ou emojis.

### Don't:

- **Don't** usar neon, gradientes de texto, gamificação agressiva ou estética promocional de fintech.
- **Don't** transformar cada grupo em um cartão flutuante com sombra; a tela deve respirar como uma página organizada.
- **Don't** usar mono como fantasia tecnológica ou como fonte principal de leitura.
- **Don't** tratar desktop como base e apenas encolher a interface no mobile.
- **Don't** substituir mensagens claras por cor, ícone ou decoração sem texto.
- **Don't** inventar valores financeiros, provas, benchmarks ou estados que não venham de dados reais da API.
