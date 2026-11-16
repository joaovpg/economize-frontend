# Interface e estilos

- Mantenha classes Tailwind no `className` do JSX; não as extraia para objetos, constantes ou
  arquivos `.ts`/`.js`. Composição condicional inline é permitida.
- Em componentes ou layouts complexos com variações/estados semânticos, use `tailwind-variants` no
  próprio `.tsx`; a configuração local de `tv` é a exceção à regra anterior.
- Se o JSX de um layout ficar poluído, crie subcomponentes locais no mesmo `.tsx`, sem extrair
  strings de classes ou texto.
- Prefira tokens semânticos de `src/styles/tokens/` e preserve os temas claro e escuro.
- Valores fora da escala padrão do Tailwind são tokens em `src/styles/tokens/`, não valores
  arbitrários no `className`. Exemplos: raios (`rounded-control`, `rounded-check`, `rounded-modal`,
  `rounded-logo`), opacidade desabilitada (`opacity-disabled`), espaçamento de modal (`p-modal`,
  `pt-modal-inset-top`), cor de controle (`bg-surface-control`), gradiente (`modal-background`) e
  transição de diálogo (`transition-dialog`). O lint (`shadcn/no-arbitrary-values`) bloqueia valores
  arbitrários; novos valores seguem o mesmo caminho. Transições de cor usam `transition-colors`.
- Reutilize componentes de `src/components/`; para controles interativos, preserve acessibilidade
  e prefira React Aria quando aplicável.
- Em formulários complexos, prefira React Hook Form com Zod. Respeite movimento reduzido em
  animações.

## Ícones

- Importe ícones Phosphor individualmente pelo caminho `@phosphor-icons/react/dist/csr/<NomeDoIcone>`,
  e não pelo entrypoint `@phosphor-icons/react`. Assim o bundler processa só os módulos usados.

  ```tsx
  import { BellSimpleIcon } from "@phosphor-icons/react/dist/csr/BellSimple";
  ```

- Novos ícones seguem o mesmo padrão. Ao atualizar a biblioteca, confirme que os caminhos
  `dist/csr` continuam disponíveis.

## Tipografia

- Use os papéis tipográficos semânticos do [catálogo](../../src/styles/tokens/utilities/typography.css).
  Eles mantêm a hierarquia visual consistente entre telas.
- `Button` e links compartilham o contrato de estilos, incluindo a tipografia base da variante
  `link`. Mudanças na tipografia base de `Button` também afetam links.
