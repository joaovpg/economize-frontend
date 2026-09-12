import {
  Children,
  Fragment,
  createContext,
  isValidElement,
  useContext,
  type ComponentPropsWithRef,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
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
  type ModalOverlayProps as AriaModalOverlayProps,
  type ModalRenderProps,
} from "react-aria-components";

import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { cn, tv } from "tailwind-variants";

import { Button } from "../Button";

const overlayStyles = tv({
  base: "fixed inset-0 z-50 grid min-h-[100dvh] w-full place-items-center overflow-y-auto bg-scrim p-4 opacity-100 backdrop-blur-[2px] transition-opacity duration-150 ease-out data-[entering]:opacity-0 data-[exiting]:opacity-0 motion-reduce:transition-none",
  variants: {
    size: {
      sm: "",
      md: "",
      lg: "max-[767px]:p-0",
      fullScreen: "p-0",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const modalStyles = tv({
  base: "group/modal flex min-h-0 max-h-[calc(100dvh-2rem)] w-full min-w-0 flex-col overflow-hidden rounded-[1.125rem] border border-border bg-[linear-gradient(180deg,var(--color-surface-value),color-mix(in_oklch,var(--color-surface-value)_96%,var(--color-canvas-value)))] p-[1.375rem] text-foreground shadow-dialog opacity-100 transition-[opacity,transform] duration-150 ease-out data-[entering]:translate-y-1 data-[entering]:opacity-0 data-[exiting]:translate-y-1 data-[exiting]:opacity-0 motion-reduce:transition-none",
  variants: {
    size: {
      sm: "max-w-[24rem]",
      md: "max-w-[32rem]",
      lg: "max-w-[48rem] max-[767px]:h-[100dvh] max-[767px]:max-h-none max-[767px]:max-w-none max-[767px]:rounded-none max-[767px]:border-0 max-[767px]:pb-[max(1rem,env(safe-area-inset-bottom))] max-[767px]:pl-[max(1rem,env(safe-area-inset-left))] max-[767px]:pr-[max(1rem,env(safe-area-inset-right))] max-[767px]:pt-[max(1rem,env(safe-area-inset-top))] max-[767px]:shadow-none",
      fullScreen:
        "h-[100dvh] max-h-none max-w-none rounded-none border-0 pb-[max(1.375rem,env(safe-area-inset-bottom))] pl-[max(1.375rem,env(safe-area-inset-left))] pr-[max(1.375rem,env(safe-area-inset-right))] pt-[max(1.375rem,env(safe-area-inset-top))] shadow-none",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type ModalSize = "sm" | "md" | "lg" | "fullScreen";
type ModalTitle = string | number | ReactElement;

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
  Pick<AriaDialogProps, "aria-describedby"> & {
    /** Conteúdo do diálogo, normalmente composto por ModalBody e ModalFooter. */
    children?: ReactNode;
    /** Classes aplicadas à superfície do diálogo. */
    className?: string;
    /** Descrição opcional renderizada no cabeçalho acessível. */
    description?: ReactNode;
    /** Classes aplicadas ao elemento semântico do diálogo. */
    dialogClassName?: string;
    /** Identificador aplicado ao elemento semântico do diálogo. */
    id?: string;
    /** Classes aplicadas ao overlay, aceitando os estados de renderização do React Aria. */
    overlayClassName?: AriaModalOverlayProps["className"];
    /** Papel semântico do diálogo. Use alertdialog somente para confirmações críticas. */
    role?: "alertdialog" | "dialog";
    /** Exibe o botão de fechamento no cabeçalho automático. */
    showCloseButton?: boolean;
    /** Tamanho visual do diálogo. */
    size?: ModalSize;
    ref?: Ref<HTMLDivElement>;
  };

type ModalAccessibleNameProps =
  | {
      /** Título visível usado para nomear o diálogo. */
      title: ModalTitle;
      "aria-label"?: string;
      "aria-labelledby"?: string;
    }
  | {
      title?: never;
      "aria-label": string;
      "aria-labelledby"?: string;
    }
  | {
      title?: never;
      "aria-label"?: string;
      "aria-labelledby": string;
    };

export type ModalProps = ModalPropsBase & ModalAccessibleNameProps;

export type ModalHeaderProps = Omit<ComponentPropsWithRef<"div">, "children" | "title"> & {
  children?: ReactNode;
  description?: ReactNode;
  showCloseButton?: boolean;
  title?: ModalTitle;
};

export type ModalBodyProps = ComponentPropsWithRef<"div">;
export type ModalFooterProps = ComponentPropsWithRef<"div">;
export type ModalTriggerProps = DialogTriggerProps;

const ModalCloseContext = createContext<(() => void) | null>(null);
const ModalCloseVisibilityContext = createContext(true);
const ModalDescriptionContext = createContext<ReactNode>(undefined);
const ModalTitleContext = createContext<ModalTitle | undefined>(undefined);

function ModalCloseButton({ onPress }: { onPress: () => void }) {
  return (
    <Button
      aria-label="Fechar modal"
      className="ml-auto shrink-0"
      isIconOnly
      onPress={onPress}
      size="sm"
      slot="close"
      variant="ghost"
    >
      <XIcon aria-hidden="true" />
    </Button>
  );
}

function hasRenderableContent(value: ReactNode) {
  if (value === null || value === undefined || value === false) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.some(hasRenderableContent);
  }

  return true;
}

function hasModalHeader(children: ReactNode): boolean {
  return Children.toArray(children).some((child) => {
    if (!isValidElement(child)) {
      return false;
    }

    if (child.type === ModalHeader) {
      return true;
    }

    return (
      child.type === Fragment &&
      isValidElement<{ children?: ReactNode }>(child) &&
      hasModalHeader(child.props.children)
    );
  });
}

/**
 * Cabeçalho visual do Modal. Quando usado dentro de um Modal, o botão de fechar usa o estado do
 * React Aria automaticamente por meio do slot close.
 */
export function ModalHeader({
  children,
  className,
  description,
  showCloseButton,
  title,
  ...props
}: ModalHeaderProps) {
  const close = useContext(ModalCloseContext);
  const inheritedShowCloseButton = useContext(ModalCloseVisibilityContext);
  const inheritedDescription = useContext(ModalDescriptionContext);
  const inheritedTitle = useContext(ModalTitleContext);
  const shouldShowCloseButton = showCloseButton ?? inheritedShowCloseButton;
  const resolvedDescription = description ?? inheritedDescription;
  const resolvedTitle = title ?? inheritedTitle;

  return (
    <div
      {...props}
      data-slot="modal-header"
      className={cn(
        "flex min-w-0 shrink-0 items-start justify-between gap-4 border-border group-has-data-[slot=modal-body]/modal:border-b group-has-data-[slot=modal-body]/modal:pb-3.5",
        className,
      )}
    >
      {(hasRenderableContent(resolvedTitle) ||
        resolvedDescription !== undefined ||
        children !== undefined) && (
        <div className="grid min-w-0 gap-1.5">
          {hasRenderableContent(resolvedTitle) && (
            <AriaHeading className="m-0 text-card-title" slot="title">
              {resolvedTitle}
            </AriaHeading>
          )}
          {resolvedDescription !== undefined && (
            <AriaText className="m-0 text-body-small text-muted" elementType="p" slot="description">
              {resolvedDescription}
            </AriaText>
          )}
          {children}
        </div>
      )}
      {shouldShowCloseButton && close && <ModalCloseButton onPress={close} />}
    </div>
  );
}

/** Corpo rolável do Modal. Use este slot para manter cabeçalho e ações fixos em conteúdos longos. */
export function ModalBody({ className, ...props }: ModalBodyProps) {
  return (
    <div
      {...props}
      data-slot="modal-body"
      className={cn(
        "grid min-h-0 min-w-0 flex-1 gap-3.5 overflow-y-auto overscroll-contain",
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
      className={cn(
        "grid min-w-0 shrink-0 grid-cols-1 gap-2 border-border group-has-[[data-slot=modal-body],[data-slot=modal-header]]/modal:border-t group-has-[[data-slot=modal-body],[data-slot=modal-header]]/modal:pt-3.5 md:flex md:flex-wrap md:justify-end",
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
  description,
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
  showCloseButton = true,
  size = "md",
  title,
  ...overlayProps
}: ModalProps) {
  const shouldRenderDefaultHeader =
    !hasModalHeader(children) &&
    (hasRenderableContent(title) || description !== undefined || showCloseButton);
  const hasValidAriaLabel = typeof ariaLabel === "string" && ariaLabel.trim().length > 0;
  const hasValidAriaLabelledby =
    typeof ariaLabelledby === "string" && ariaLabelledby.trim().length > 0;
  const resolvedAriaLabel =
    hasValidAriaLabel || hasValidAriaLabelledby || hasRenderableContent(title)
      ? hasValidAriaLabel
        ? ariaLabel
        : undefined
      : "Modal";
  const resolvedAriaLabelledby = hasValidAriaLabelledby ? ariaLabelledby : undefined;
  const resolvedOverlayClassName = composeRenderProps(
    overlayClassName,
    (userClassName: string | undefined, _renderProps: ModalRenderProps) =>
      overlayStyles({ className: userClassName, size }),
  );

  return (
    <AriaModalOverlay
      {...overlayProps}
      className={resolvedOverlayClassName}
      defaultOpen={defaultOpen}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      shouldCloseOnInteractOutside={shouldCloseOnInteractOutside}
    >
      <AriaModal
        className={modalStyles({ className, size })}
        data-size={size}
        data-slot="modal"
        ref={ref}
      >
        <AriaDialog
          aria-describedby={ariaDescribedby}
          aria-label={resolvedAriaLabel}
          aria-labelledby={resolvedAriaLabelledby}
          className={cn(
            "flex max-h-full min-h-0 min-w-0 flex-1 flex-col gap-3.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand",
            dialogClassName,
          )}
          id={id}
          role={role}
        >
          {({ close }) => (
            <ModalCloseVisibilityContext.Provider value={showCloseButton}>
              <ModalTitleContext.Provider value={title}>
                <ModalDescriptionContext.Provider value={description}>
                  <ModalCloseContext.Provider value={close}>
                    {shouldRenderDefaultHeader && (
                      <ModalHeader
                        description={description}
                        showCloseButton={showCloseButton}
                        title={title}
                      />
                    )}
                    {children}
                  </ModalCloseContext.Provider>
                </ModalDescriptionContext.Provider>
              </ModalTitleContext.Provider>
            </ModalCloseVisibilityContext.Provider>
          )}
        </AriaDialog>
      </AriaModal>
    </AriaModalOverlay>
  );
}
