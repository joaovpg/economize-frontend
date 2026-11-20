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

## Campos de formulário

- Duas camadas. `src/components/primitives/` tem a anatomia: `field/` (`FieldGroup`, `Input`, `TextArea`, `FieldButton`, `FieldIcon`, `Label`, `Description`, `FieldHeader`, `FieldError` e `fieldStyles.ts`), `listbox/` (`Popover`, `ListBox`, `ListBoxItem`, `SearchInput`) e `Legend.tsx`. `src/components/fields/` monta os campos só com primitivos: `TextField`, `PasswordField`, `TextArea`, `NumberField`, `CurrencyField`, `Select` (+ `SelectItem`), `DatePicker`, `Checkbox`, `RadioGroup` (+ `RadioItem`) e `Switch`.
- Primitivos leem o estado pelo contexto e pelos `data-*` do React Aria. Não passe `isDisabled` a um primitivo só para colorir o texto.
- Campos aceitam `label`, `description`, `errorMessage`, `isInvalid`, `reserveErrorSpace`, `isRequired`, `isDisabled`, `isReadOnly`, `size` (`md` ou `sm`) e `className`. Todos usam `validationBehavior="aria"`. Validação fica no Zod; o campo só exibe a mensagem.
- Modelo de estados, igual na caixa do input, no botão do Select e na área de texto:
  - repouso: `rounded-control border border-border bg-surface`;
  - hover: `border-border-strong`;
  - foco: `border-brand` com anel de 1px (`outline-1 outline-solid outline-brand`, total de 2px);
  - inválido: `border-danger`, com anel `outline-danger` quando focado;
  - pressionado (só o botão do Select): `bg-surface-muted`;
  - desabilitado: `bg-surface-muted text-muted`, sem hover nem anel;
  - somente leitura: igual ao repouso, sem hover nem anel.
- Os estados vêm de `data-*`. A raiz de cada campo é o grupo nomeado `group/field`; inválido, desabilitado e somente leitura são lidos com `group-data-<estado>/field` (o nome evita herdar o estado de outro `group` ancestral), e foco e hover, do próprio elemento. Toda regra com estado tem guardas `not-*`, para que as regras sejam exclusivas e não dependam da ordem do CSS. Inválido vence hover e foco de marca.
- Pilha do campo: cabeçalho (`FieldHeader`, rótulo e descrição colados), caixa e erro com `min-h-4` reservado. A raiz usa `row-span-3 grid-rows-subgrid`: em uma grade com colunas, cabeçalho, caixa e erro alinham com os vizinhos; fora de grade, comporta-se como um grid comum.
- Obrigatório: `isRequired` mostra "(obrigatório)" à direita do rótulo, com `aria-hidden`, porque o campo já anuncia `aria-required`. Passe `isRequired` aos campos que o schema Zod torna obrigatórios. Campos opcionais não recebem a marca.
- Contrato com React Hook Form: use `Controller` e espalhe `{...field}`. Ele entrega `value`, `onChange(value)`, `onBlur`, `name` e `ref`, e o `ref` aponta para o elemento focável: input, textarea, botão do Select ou segmento de data. Passe `errorMessage={fieldState.error?.message}`. Não use `register` em campo novo: o `onChange` dele recebe evento, não valor.
- `Checkbox`, `RadioGroup` e `Switch` não recebem `ref`, porque não têm um único elemento focável.
- Radio: só o clássico, sem pill nem segmentado. Use `orientation="horizontal"` para opções curtas, e o padrão `vertical` para as demais.
- Select: `isSearchable` mostra uma busca no topo da lista e filtra pelo texto. Use em contas e categorias. O botão mostra o `textValue` do item escolhido. Sem resultado, a lista mostra "Nenhuma opção encontrada".
- Ícone decorativo dentro da caixa é `FieldIcon`; botão de ação dentro da caixa (olho da senha, calendário, stepper) é `FieldButton`.

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
