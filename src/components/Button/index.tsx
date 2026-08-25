import { type ReactNode, type Ref } from "react";
import {
  Button as AriaButton,
  ProgressBar,
  composeRenderProps,
  type ButtonProps as AriaButtonProps,
  type ButtonRenderProps,
} from "react-aria-components";

import { IconSlot } from "../IconSlot";
import { buttonStyles, type ButtonStyleProps } from "./buttonStyles";

const pendingIndicator = (
  <span className="sr-only" aria-hidden="true">
    Carregando
  </span>
);

function PendingProgress() {
  return (
    <ProgressBar aria-label="Carregando" isIndeterminate className="sr-only">
      {pendingIndicator}
    </ProgressBar>
  );
}

function PendingSpinner() {
  return (
    <IconSlot>
      <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none" />
    </IconSlot>
  );
}

export type ButtonProps = Omit<AriaButtonProps, "className"> &
  ButtonStyleProps & {
    className?: AriaButtonProps["className"];
    ref?: Ref<HTMLButtonElement>;
    /** Ícone decorativo exibido antes do conteúdo visível. */
    leadingIcon?: ReactNode;
    /** Ícone decorativo exibido depois do conteúdo visível. */
    trailingIcon?: ReactNode;
  };

/**
 * Botão de ação do Economize, com os estados e variantes visuais do design system.
 *
 * O componente mantém a semântica e os eventos do React Aria. Use `onPress` para ações, `isPending`
 * para operações em andamento e `isIconOnly` somente quando o controle tiver um nome acessível,
 * normalmente por meio de `aria-label`.
 *
 * @see https://react-aria.adobe.com/Button
 */
export function Button({
  children,
  className,
  isIconOnly = false,
  isPending = false,
  leadingIcon,
  size = "md",
  trailingIcon,
  variant = "primary",
  ref,
  ...buttonProps
}: ButtonProps) {
  const resolvedClassName = composeRenderProps(
    className,
    (userClassName: string | undefined, _renderProps: ButtonRenderProps) =>
      buttonStyles({
        className: userClassName,
        isIconOnly,
        size,
        variant,
      }),
  );

  const resolvedChildren = composeRenderProps(
    children,
    (content: ReactNode, renderProps: ButtonRenderProps) => (
      <>
        {isIconOnly && renderProps.isPending ? (
          <PendingSpinner />
        ) : (
          <>
            {renderProps.isPending ? <PendingSpinner /> : <IconSlot>{leadingIcon}</IconSlot>}
            {isIconOnly ? <IconSlot>{content}</IconSlot> : content}
            {!isIconOnly && <IconSlot>{trailingIcon}</IconSlot>}
          </>
        )}
        {renderProps.isPending && <PendingProgress />}
      </>
    ),
  );

  return (
    <AriaButton {...buttonProps} ref={ref} className={resolvedClassName} isPending={isPending}>
      {resolvedChildren}
    </AriaButton>
  );
}
