# Interface e estilos

## Classes e componentes

- Escreva as classes Tailwind no `className` do JSX; composição condicional inline é permitida.
- Use `tv` no próprio `.tsx` quando o componente tiver variantes ou estados semânticos.
- Importe `twMerge`, `tv` e `cn` de `src/utils/tailwind.ts`. A configuração dali registra os papéis
  tipográficos; o `tailwind-merge` padrão confunde um papel com cor e o descarta ao lado de uma
  classe de cor. Ela também registra os raios e os tamanhos nomeados; um token novo em
  `shape.css` entra lá na mesma alteração.
- Quando o JSX de um layout ficar poluído, crie subcomponentes locais no mesmo `.tsx`.
- Reutilize componentes de `src/components/`. Para controles interativos, use React Aria e preserve
  a acessibilidade.
- Em formulários complexos, use React Hook Form com Zod.
- Animações respeitam movimento reduzido (`motion-reduce:`); transições de cor usam
  `transition-colors`.

## Tokens

- Cores, raios, espaçamentos e efeitos vêm de `src/styles/tokens/`, com nomes semânticos que
  funcionam nos temas claro e escuro. As escalas padrão do Tailwind (cores, espaçamento, raios,
  sombras e blur) estão desligadas: só existem os tokens do projeto.
- Primitivas (`primitives/colors.css`) são variáveis CSS comuns, sem classes. Só as cores
  semânticas viram utilitários (`bg-surface`, `text-muted`).
- Espaçamento usa uma escala fechada: `0`, `px`, `1` a `6`, `8`, `10`, `12`, `16`, `20` e `24`.
  Vale para padding, margem, gap, tamanho, inset e translate. Um valor fora dela vira token com
  nome de papel em `shape.css` (`min-h-state-loading`, `w-calendar`) ou um `calc()` com
  `var(--spacing-*)`. O alvo de toque no celular é `touch` (44px).
- Raios têm quatro papéis:
  - `rounded-sm` (4px): checkbox, tags e itens internos de segmentado;
  - `rounded-control` (8px): botões, campos, itens de menu e blocos internos de formulário;
  - `rounded-surface` (12px): card, modal e popover;
  - `rounded-full`: pills, switch, spinners e avatares.
    Um item dentro de um container com `p-1` usa o raio do container menos 4px. Itens de segmentado
    usam `Button shape="segment"`.
- Sombra só em camada flutuante (`shadow-popover`, `shadow-dialog`). A estrutura usa borda.
- Sem gradiente, blur ou translucidez decorativa. `scrim` é a única exceção.
- Verde esmeralda (`brand`) fica restrito a ação primária, foco, seleção e links. `muted` é a única
  cor de texto secundário.
- Os neutros são frios (matiz 255). `success` usa a cor da marca, pois o verde indica valor positivo.
- Verde e vermelho por sinal aparecem só em totais e métricas (cards de resumo). Valores de linha e
  zero ficam neutros (`text-foreground`), com o sinal `+`/`−` mantido.
- Controles têm 40px (`h-10`) e, no `size="sm"`, 32px (`h-8`). No celular, o `md` e os campos usam
  44px (`max-md:h-touch`).

## Responsividade

- Escreva mobile-first: o estilo base vale para o celular, e `sm:`, `md:` e `lg:` ampliam o layout.
- Use os breakpoints nomeados do Tailwind (`sm:`, `md:`, `lg:`); `max-md:` serve para o que vale só
  no celular. Breakpoints com valor arbitrário não são usados.

## Tipografia

- A interface usa uma família, Geist, e os papéis de
  [`typography.css`](../../src/styles/tokens/utilities/typography.css). O papel define tamanho,
  altura de linha, peso e espaçamento entre letras; a cor é uma classe separada (`text-muted`,
  `text-foreground`).
- Cada texto recebe um papel e uma cor. Um ajuste tipográfico novo entra no catálogo, como papel ou
  como mudança de um papel existente.
- Quando usar cada papel:
  - `text-title-page`: título principal da tela.
  - `text-title`: títulos de seção, cartão e diálogo.
  - `text-body`: texto padrão e descrições.
  - `text-body-strong`: rótulos de campo e de opção, botões, links, nomes e valores.
  - `text-caption`: metadados, ajuda, erros de campo e cabeçalhos de tabela.
  - `text-metric`: saldos e totais em destaque.
- Valores monetários e totais numéricos levam `tabular-nums`, para alinhar colunas.
- Campos digitáveis usam `text-body max-md:text-md`: 16px no celular evitam o zoom automático do iOS.
- `Button` e links compartilham `src/components/Button/buttonStyles.ts`; mudar a tipografia base do
  botão também muda os links.

## Ícones

- Importe cada ícone Phosphor pelo caminho `@phosphor-icons/react/dist/csr/<NomeDoIcone>`, para o
  bundler processar só os módulos usados:

  ```tsx
  import { BellSimpleIcon } from "@phosphor-icons/react/dist/csr/BellSimple";
  ```

- Ao atualizar a biblioteca, confirme que os caminhos `dist/csr` continuam disponíveis.
