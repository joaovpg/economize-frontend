import { tv } from "../../../utils/tailwind";

/**
 * Estilos compartilhados pelos campos com caixa: a caixa do input (`FieldGroup`), o botão do Select
 * e a área de texto (`TextArea`).
 *
 * Os estados vêm dos atributos `data-*` do React Aria, e a raiz de cada campo é `group/field`.
 * Estado de caixa vem de `group-data-<estado>/field` (inválido, desabilitado, somente leitura);
 * estado de foco e hover vem do próprio elemento. Cada regra exige o estado positivo e as guardas
 * `not-*`, para que as regras sejam mutuamente exclusivas e não dependam da ordem do CSS: inválido
 * vence hover e foco de marca; desabilitado e somente leitura não têm hover nem anel.
 *
 * As classes ficam literais para o Tailwind encontrá-las; não monte variantes por concatenação.
 */

const withinStates = [
  "data-hovered:not-data-focus-within:not-group-data-invalid/field:not-group-data-disabled/field:not-group-data-readonly/field:border-border-strong",
  "data-focus-within:not-group-data-invalid/field:not-group-data-disabled/field:not-group-data-readonly/field:border-brand",
  "data-focus-within:not-group-data-invalid/field:not-group-data-disabled/field:not-group-data-readonly/field:outline-1 data-focus-within:not-group-data-invalid/field:not-group-data-disabled/field:not-group-data-readonly/field:outline-solid data-focus-within:not-group-data-invalid/field:not-group-data-disabled/field:not-group-data-readonly/field:outline-offset-0 data-focus-within:not-group-data-invalid/field:not-group-data-disabled/field:not-group-data-readonly/field:outline-brand",
  "group-data-invalid/field:not-group-data-disabled/field:border-danger",
  "data-focus-within:group-data-invalid/field:not-group-data-disabled/field:not-group-data-readonly/field:outline-1 data-focus-within:group-data-invalid/field:not-group-data-disabled/field:not-group-data-readonly/field:outline-solid data-focus-within:group-data-invalid/field:not-group-data-disabled/field:not-group-data-readonly/field:outline-offset-0 data-focus-within:group-data-invalid/field:not-group-data-disabled/field:not-group-data-readonly/field:outline-danger",
].join(" ");

const fieldStates = [
  "data-hovered:not-data-focused:not-group-data-invalid/field:not-group-data-disabled/field:not-group-data-readonly/field:border-border-strong",
  "data-focused:not-group-data-invalid/field:not-group-data-disabled/field:not-group-data-readonly/field:border-brand",
  "data-focused:not-group-data-invalid/field:not-group-data-disabled/field:not-group-data-readonly/field:outline-1 data-focused:not-group-data-invalid/field:not-group-data-disabled/field:not-group-data-readonly/field:outline-solid data-focused:not-group-data-invalid/field:not-group-data-disabled/field:not-group-data-readonly/field:outline-offset-0 data-focused:not-group-data-invalid/field:not-group-data-disabled/field:not-group-data-readonly/field:outline-brand",
  "group-data-invalid/field:not-group-data-disabled/field:border-danger",
  "data-focused:group-data-invalid/field:not-group-data-disabled/field:not-group-data-readonly/field:outline-1 data-focused:group-data-invalid/field:not-group-data-disabled/field:not-group-data-readonly/field:outline-solid data-focused:group-data-invalid/field:not-group-data-disabled/field:not-group-data-readonly/field:outline-offset-0 data-focused:group-data-invalid/field:not-group-data-disabled/field:not-group-data-readonly/field:outline-danger",
].join(" ");

const triggerStates = [
  "data-hovered:not-data-focus-visible:not-group-data-open/field:not-group-data-invalid/field:not-group-data-disabled/field:border-border-strong",
  "data-pressed:not-group-data-disabled/field:bg-surface-muted",
  "data-focus-visible:not-group-data-invalid/field:not-group-data-disabled/field:border-brand group-data-open/field:not-group-data-invalid/field:not-group-data-disabled/field:border-brand",
  "data-focus-visible:not-group-data-invalid/field:not-group-data-disabled/field:outline-1 data-focus-visible:not-group-data-invalid/field:not-group-data-disabled/field:outline-solid data-focus-visible:not-group-data-invalid/field:not-group-data-disabled/field:outline-offset-0 data-focus-visible:not-group-data-invalid/field:not-group-data-disabled/field:outline-brand group-data-open/field:not-group-data-invalid/field:not-group-data-disabled/field:outline-1 group-data-open/field:not-group-data-invalid/field:not-group-data-disabled/field:outline-solid group-data-open/field:not-group-data-invalid/field:not-group-data-disabled/field:outline-offset-0 group-data-open/field:not-group-data-invalid/field:not-group-data-disabled/field:outline-brand",
  "group-data-invalid/field:not-group-data-disabled/field:border-danger",
  "data-focus-visible:group-data-invalid/field:not-group-data-disabled/field:outline-1 data-focus-visible:group-data-invalid/field:not-group-data-disabled/field:outline-solid data-focus-visible:group-data-invalid/field:not-group-data-disabled/field:outline-offset-0 data-focus-visible:group-data-invalid/field:not-group-data-disabled/field:outline-danger group-data-open/field:group-data-invalid/field:not-group-data-disabled/field:outline-1 group-data-open/field:group-data-invalid/field:not-group-data-disabled/field:outline-solid group-data-open/field:group-data-invalid/field:not-group-data-disabled/field:outline-offset-0 group-data-open/field:group-data-invalid/field:not-group-data-disabled/field:outline-danger",
].join(" ");

/**
 * Caixa do campo. `focus` escolhe o elemento que mostra foco: `within` (caixa com input dentro),
 * `field` (textarea, que é a própria caixa) ou `trigger` (botão do Select, que também abre com
 * `data-open` no grupo).
 */
export const fieldBoxStyles = tv({
  base: "min-w-0 rounded-control border border-border bg-surface text-foreground transition-colors motion-reduce:transition-none group-data-disabled/field:cursor-not-allowed group-data-disabled/field:bg-surface-muted group-data-disabled/field:text-muted",
  variants: {
    focus: {
      within: withinStates,
      field: fieldStates,
      trigger: triggerStates,
    },
    size: {
      md: "h-10 px-3 max-md:h-touch",
      sm: "h-8 px-2",
    },
  },
  defaultVariants: {
    focus: "within",
  },
});

/** Texto digitado dentro da caixa. Desabilitado usa `text-muted`; o alinhamento é do chamador. */
export const fieldInputStyles =
  "h-full min-w-0 flex-1 border-0 bg-transparent text-body text-foreground caret-brand outline-none placeholder:text-muted data-disabled:text-muted max-md:text-md";
