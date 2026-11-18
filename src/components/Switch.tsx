import { SwitchButton, SwitchField } from "react-aria-components";

import { tv } from "../utils/tailwind";

const switchStyles = tv(
  {
    slots: {
      button:
        "group inline-flex min-h-8 max-md:min-h-touch cursor-pointer items-center rounded-control p-1 transition-colors outline-none data-disabled:cursor-not-allowed data-disabled:opacity-disabled data-focus-visible:bg-surface-muted",
      thumb:
        "block size-4 rounded-full border border-border bg-surface transition-transform duration-150 ease-out group-data-selected:translate-x-3 motion-reduce:transition-none",
      track:
        "relative block h-5 w-8 rounded-full border-2 border-transparent bg-border-strong transition-colors duration-150 ease-out group-data-selected:bg-brand motion-reduce:transition-none",
    },
  },
  { twMerge: false },
);

export type SwitchProps = {
  /** Nome acessível do switch; obrigatório porque o controle não exibe texto. */
  "aria-label": string;
  /** Impede a alternância e aplica o estado desabilitado. */
  isDisabled?: boolean;
  /** Estado ligado (true) ou desligado (false). */
  isSelected: boolean;
  /** Recebe o próximo estado ao alternar. */
  onChange: (isSelected: boolean) => void;
};

/** Switch liga/desliga sem texto visível, com o visual e o foco do Economize. */
export function Switch({
  "aria-label": ariaLabel,
  isDisabled = false,
  isSelected,
  onChange,
}: SwitchProps) {
  const { button, thumb, track } = switchStyles();

  return (
    <SwitchField
      aria-label={ariaLabel}
      className="contents"
      isDisabled={isDisabled}
      isSelected={isSelected}
      onChange={onChange}
    >
      <SwitchButton className={button()}>
        <span className={track()}>
          <span className={thumb()} />
        </span>
      </SwitchButton>
    </SwitchField>
  );
}
