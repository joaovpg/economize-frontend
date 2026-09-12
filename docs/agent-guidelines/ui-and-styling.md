# Interface e estilos

- Mantenha classes Tailwind no `className` do JSX; não as extraia para objetos, constantes ou
  arquivos `.ts`/`.js`. Composição condicional inline é permitida.
- Em componentes ou layouts complexos com variações/estados semânticos, use `tailwind-variants` no
  próprio `.tsx`; a configuração local de `tv` é a exceção à regra anterior.
- Se o JSX de um layout ficar poluído, crie subcomponentes locais no mesmo `.tsx`, sem extrair
  strings de classes ou texto.
- Prefira tokens semânticos de `src/styles/tokens/` e preserve os temas claro e escuro.
- Reutilize componentes de `src/components/`; para controles interativos, preserve acessibilidade
  e prefira React Aria quando aplicável.
- Em formulários complexos, prefira React Hook Form com Zod. Respeite movimento reduzido em
  animações.
- Importe ícones Phosphor individualmente conforme o [ADR-0002](../adr/0002-phosphor-icons-import-performance.md).
- Use os papéis tipográficos do [catálogo](../../src/styles/tokens/utilities/typography.css) e
  preserve a tipografia da variante `link`, conforme o [ADR-0005](../adr/0005-escala-tipografica-semantica-e-estilo-base-de-links.md).
