# Interface e estilos

## Classes e componentes

- Escreva as classes Tailwind no `className` do JSX; composição condicional inline é permitida.
- Use `tv` no próprio `.tsx` quando o componente tiver variantes ou estados semânticos.
- Importe `twMerge`, `tv` e `cn` de `src/utils/tailwind.ts`. A configuração dali registra os papéis
  tipográficos; o `tailwind-merge` padrão confunde um papel com cor e o descarta ao lado de uma
  classe de cor.
- Quando o JSX de um layout ficar poluído, crie subcomponentes locais no mesmo `.tsx`.
- Reutilize componentes de `src/components/`. Para controles interativos, use React Aria e preserve
  a acessibilidade.
- Em formulários complexos, use React Hook Form com Zod.
- Animações respeitam movimento reduzido (`motion-reduce:`); transições de cor usam
  `transition-colors`.

## Tokens

- Cores, raios, espaçamentos e efeitos vêm de `src/styles/tokens/`, com nomes semânticos que
  funcionam nos temas claro e escuro.
- Um valor fora da escala do Tailwind vira um token novo em `src/styles/tokens/`.

## Responsividade

- Escreva mobile-first: o estilo base vale para o celular, e `sm:`, `md:` e `lg:` ampliam o layout.
- Use os breakpoints nomeados do Tailwind; `max-md:` serve para o que vale só no celular.
- Breakpoints com valor arbitrário (`max-[40rem]`, `max-[48rem]`) são legado. Ao alterar uma linha
  que os usa, troque pelo nome equivalente (`max-sm`, `max-md`).

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
