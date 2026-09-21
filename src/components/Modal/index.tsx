import { type ComponentPropsWithRef, type ReactNode, type Ref } from "react";
import {
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Heading as AriaHeading,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
  Text as AriaText,
  composeRenderProps,
  type DialogProps as AriaDialogProps,
  type DialogTriggerProps,
  type HeadingProps as AriaHeadingProps,
  type ModalOverlayProps as AriaModalOverlayProps,
  type ModalRenderProps,
  type TextProps as AriaTextProps,
} from "react-aria-components";

import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";

import { Button, type ButtonProps } from "../Button";

const overlayStyles = tv({
  base: "fixed inset-0 isolate z-20 w-full max-w-full overflow-x-hidden overflow-y-auto bg-scrim backdrop-blur-lg opacity-100 transition-opacity duration-150 ease-out motion-reduce:transition-none",
  variants: {
    isEntering: {
      true: "opacity-0",
    },
    isExiting: {
      true: "opacity-0",
    },
  },
});

const modalWrapperStyles = tv({
  base: "box-border flex min-h-full min-w-0 w-full items-center justify-center p-4 text-center",
  variants: {
    size: {
      fullScreen: "p-0",
      lg: "max-[767px]:p-0",
      md: "",
      sm: "",
    },
  },
});

const modalStyles = tv({
  base: "group/modal flex min-h-0 max-h-[calc(100dvh-2rem)] w-full min-w-0 flex-col overflow-hidden rounded-[1.125rem] border border-border bg-[linear-gradient(180deg,var(--color-surface-value),color-mix(in_oklch,var(--color-surface-value)_96%,var(--color-canvas-value)))] p-[1.375rem] text-left text-foreground shadow-dialog opacity-100 transition-[opacity,transform] duration-150 ease-out data-[entering]:translate-y-1 data-[entering]:opacity-0 data-[exiting]:translate-y-1 data-[exiting]:opacity-0 motion-reduce:transition-none",
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      fullScreen:
        "h-[100dvh] max-h-none max-w-none rounded-none border-0 pb-[max(1.375rem,env(safe-area-inset-bottom))] pl-[max(1.375rem,env(safe-area-inset-left))] pr-[max(1.375rem,env(safe-area-inset-right))] pt-[max(1.375rem,env(safe-area-inset-top))] shadow-none",
      lg: "max-w-[48rem] max-[767px]:h-[100dvh] max-[767px]:max-h-none max-[767px]:max-w-none max-[767px]:rounded-none max-[767px]:border-0 max-[767px]:pb-[max(1rem,env(safe-area-inset-bottom))] max-[767px]:pl-[max(1rem,env(safe-area-inset-left))] max-[767px]:pr-[max(1rem,env(safe-area-inset-right))] max-[767px]:pt-[max(1rem,env(safe-area-inset-top))] max-[767px]:shadow-none",
      md: "max-w-[32rem]",
      sm: "max-w-[24rem]",
    },
  },
});

export type ModalSize = "sm" | "md" | "lg" | "fullScreen";

type ModalPropsBase = Omit<
  AriaModalOverlayProps,
  | "aria-describedby"
  | "aria-label"
  | "aria-labelledby"
  | "children"
  | "className"
  | "id"
  | "role"
  | "title"
> &
  Pick<AriaDialogProps, "aria-describedby" | "aria-label" | "aria-labelledby"> & {
    /** Conteúdo do diálogo, normalmente composto por ModalBody e ModalFooter. */
    children?: ReactNode;
    /** Classes aplicadas à superfície do diálogo. */
    className?: string;
    /** Classes aplicadas ao elemento semântico do diálogo. */
    dialogClassName?: string;
    /** Identificador aplicado ao elemento semântico do diálogo. */
    id?: string;
    /** Classes aplicadas ao overlay, aceitando os estados de renderização do React Aria. */
    overlayClassName?: AriaModalOverlayProps["className"];
    /** Papel semântico do diálogo. Use alertdialog somente para confirmações críticas. */
    role?: "alertdialog" | "dialog";
    /** Tamanho visual do diálogo. */
    size?: ModalSize;
    ref?: Ref<HTMLDivElement>;
  };

export type ModalProps = ModalPropsBase;

export type ModalHeaderProps = ComponentPropsWithRef<"div">;
export type ModalTitleProps = Omit<AriaHeadingProps, "children" | "slot"> & {
  children: ReactNode;
};
export type ModalDescriptionProps = Omit<AriaTextProps, "children" | "elementType" | "slot"> & {
  children: ReactNode;
};
export type ModalCloseProps = Omit<ButtonProps, "slot">;

export type ModalBodyProps = ComponentPropsWithRef<"div">;
export type ModalFooterProps = ComponentPropsWithRef<"div">;
export type ModalTriggerProps = DialogTriggerProps;

const defaultModalCloseIcon = <XIcon aria-hidden="true" />;

/** Título semântico que nomeia o diálogo pelo slot `title` do React Aria. */
export function ModalTitle({ children, className, ...props }: ModalTitleProps) {
  return (
    <AriaHeading
      {...props}
      className={twMerge("m-0 text-card-title", className)}
      data-slot="modal-title"
      slot="title"
    >
      {children}
    </AriaHeading>
  );
}

/** Descrição semântica associada ao diálogo pelo slot `description` do React Aria. */
export function ModalDescription({ children, className, ...props }: ModalDescriptionProps) {
  return (
    <AriaText
      {...props}
      className={twMerge("m-0 text-body-small text-muted", className)}
      data-slot="modal-description"
      elementType="p"
      slot="description"
    >
      {children}
    </AriaText>
  );
}

/** Botão explícito de fechamento conectado ao estado do diálogo pelo slot `close`. */
export function ModalClose({
  "aria-label": ariaLabel = "Fechar modal",
  children = defaultModalCloseIcon,
  className,
  isIconOnly = true,
  size = "sm",
  variant = "ghost",
  ...props
}: ModalCloseProps) {
  const resolvedClassName = composeRenderProps(
    className,
    (userClassName: string | undefined) =>
      twMerge("absolute top-0 right-0 shrink-0", userClassName) ?? "",
  );

  return (
    <Button
      {...props}
      aria-label={ariaLabel}
      className={resolvedClassName}
      data-slot="modal-close"
      isIconOnly={isIconOnly}
      size={size}
      slot="close"
      variant={variant}
    >
      {children}
    </Button>
  );
}

/** Cabeçalho visual do Modal. Componha-o com ModalTitle, ModalDescription e ModalClose. */
export function ModalHeader({ children, className, ...props }: ModalHeaderProps) {
  return (
    <div
      {...props}
      data-slot="modal-header"
      className={twMerge(
        "group/modal-header relative flex min-w-0 shrink-0 flex-col gap-1.5 border-border group-has-data-[slot=modal-body]/modal:border-b group-has-data-[slot=modal-body]/modal:pb-3.5 group-has-data-[slot=modal-close]/modal-header:pr-12",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Corpo rolável do Modal. Use este slot para manter cabeçalho e ações fixos em conteúdos longos. */
export function ModalBody({ className, ...props }: ModalBodyProps) {
  return (
    <div
      {...props}
      data-slot="modal-body"
      className={twMerge(
        "flex min-h-0 min-w-0 flex-1 flex-col gap-3.5 overflow-x-hidden overflow-y-auto overscroll-contain",
        className,
      )}
    />
  );
}

/** Rodapé de ações do Modal, empilhado no celular e disposto em linha em telas maiores. */
export function ModalFooter({ className, ...props }: ModalFooterProps) {
  return (
    <div
      {...props}
      data-slot="modal-footer"
      className={twMerge(
        "flex min-w-0 shrink-0 flex-col gap-2 border-border group-has-[[data-slot=modal-body],[data-slot=modal-header]]/modal:border-t group-has-[[data-slot=modal-body],[data-slot=modal-header]]/modal:pt-3.5 md:flex-row md:flex-wrap md:justify-end",
        className,
      )}
    />
  );
}

/** Gatilho opcional que conecta um controle ao estado gerenciado pelo React Aria. */
export function ModalTrigger(props: ModalTriggerProps) {
  return <AriaDialogTrigger {...props} />;
}

/**
 * Modal reutilizável com estado controlado ou gerenciado por ModalTrigger.
 *
 * O componente usa um portal no document.body por meio do React Aria, bloqueia a rolagem da página
 * enquanto está aberto e restaura o foco ao elemento que o abriu ao ser fechado.
 */
export function Modal({
  "aria-describedby": ariaDescribedby,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  children,
  className,
  defaultOpen,
  dialogClassName,
  id,
  isDismissable = false,
  isKeyboardDismissDisabled = false,
  isOpen,
  onOpenChange,
  overlayClassName,
  ref,
  role = "dialog",
  shouldCloseOnInteractOutside,
  size = "md",
  ...overlayProps
}: ModalProps) {
  const resolvedOverlayClassName = composeRenderProps(
    overlayClassName,
    (userClassName: string | undefined, { isEntering, isExiting }: ModalRenderProps) =>
      overlayStyles({ className: userClassName, isEntering, isExiting }),
  );

  return (
    <AriaModalOverlay
      {...overlayProps}
      className={resolvedOverlayClassName}
      data-slot="modal-overlay"
      defaultOpen={defaultOpen}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      shouldCloseOnInteractOutside={shouldCloseOnInteractOutside}
    >
      <div className={modalWrapperStyles({ size })}>
        <AriaModal
          className={modalStyles({ className, size })}
          data-size={size}
          data-slot="modal"
          ref={ref}
        >
          <AriaDialog
            aria-describedby={ariaDescribedby}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            className={twMerge(
              "flex max-h-full min-h-0 min-w-0 flex-1 flex-col gap-3.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand",
              dialogClassName,
            )}
            id={id}
            role={role}
          >
            {children}
          </AriaDialog>
        </AriaModal>
      </div>
    </AriaModalOverlay>
  );
}
