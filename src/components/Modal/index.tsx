import {
  useLayoutEffect,
  useRef,
  type ComponentPropsWithRef,
  type ReactNode,
  type Ref,
  type RefObject,
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
  type HeadingProps as AriaHeadingProps,
  type ModalOverlayProps as AriaModalOverlayProps,
  type TextProps as AriaTextProps,
} from "react-aria-components";

import { XIcon } from "@phosphor-icons/react/dist/csr/X";

import { tv, twMerge } from "../../utils/tailwind";
import { Button, type ButtonProps } from "../Button";

// Mobile first. Formulários `md` e `lg` ocupam a tela inteira no celular; confirmações
// (`alertdialog` ou `sm`) continuam como cartão em todos os tamanhos. A partir de `md` todo
// diálogo vira um cartão centralizado.
const overlayStyles = tv({
  base: "fixed inset-0 isolate z-20 flex justify-center overflow-hidden bg-scrim transition-opacity duration-200 ease-out motion-reduce:transition-none",
  defaultVariants: {
    presentation: "card",
  },
  variants: {
    presentation: {
      card: "items-center p-4",
      fullScreen: "items-stretch md:items-center md:p-4",
    },
    isEntering: {
      true: "opacity-0",
    },
    isExiting: {
      true: "opacity-0",
    },
  },
});

const modalStyles = tv({
  base: "group/modal flex min-h-0 min-w-0 w-full flex-col overflow-hidden bg-surface text-left text-foreground transition-dialog duration-200 ease-out motion-reduce:transition-none data-[entering]:opacity-0 data-[exiting]:opacity-0 md:data-[entering]:translate-y-2 md:data-[exiting]:translate-y-2",
  defaultVariants: {
    presentation: "card",
    size: "md",
  },
  variants: {
    presentation: {
      card: "max-h-[calc(var(--visual-viewport-height,100dvh)-2rem)] rounded-surface border border-border shadow-dialog",
      fullScreen:
        "h-dvh max-w-none md:h-auto md:max-h-[calc(var(--visual-viewport-height,100dvh)-2rem)] md:rounded-surface md:border md:border-border md:shadow-dialog",
    },
    size: {
      sm: "md:max-w-sm",
      md: "md:max-w-lg",
      lg: "md:max-w-3xl",
    },
  },
});

type ModalSize = "sm" | "md" | "lg";

export type ModalProps = Omit<
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
    /** Conteúdo do diálogo, normalmente composto por ModalHeader, ModalBody e ModalFooter. */
    children?: ReactNode;
    /** Classes aplicadas à superfície do diálogo. */
    className?: string;
    /** Identificador aplicado ao elemento semântico do diálogo. */
    id?: string;
    /** Elemento que deve receber o foco inicial quando o diálogo abrir. */
    initialFocus?: RefObject<HTMLElement | null>;
    /** Papel semântico do diálogo. Use alertdialog somente para confirmações críticas. */
    role?: "alertdialog" | "dialog";
    /**
     * Tamanho do diálogo. Em telas médias ou maiores define a largura máxima. No celular, `md` e
     * `lg` ocupam a tela inteira; `sm` e `alertdialog` continuam como cartão.
     */
    size?: ModalSize;
    ref?: Ref<HTMLDivElement>;
  };

export type ModalHeaderProps = ComponentPropsWithRef<"div"> & {
  /** Exibe o botão de fechar no canto superior direito. Oculte apenas durante o envio. */
  showClose?: boolean;
  /** Nome acessível do botão de fechar. */
  closeLabel?: string;
};
export type ModalTitleProps = Omit<AriaHeadingProps, "children" | "slot"> & {
  children: ReactNode;
};
export type ModalDescriptionProps = Omit<AriaTextProps, "children" | "elementType" | "slot"> & {
  children: ReactNode;
};
type ModalCloseProps = Omit<ButtonProps, "slot">;

export type ModalBodyProps = ComponentPropsWithRef<"div">;
export type ModalFooterProps = ComponentPropsWithRef<"div">;
export type ModalTriggerProps = DialogTriggerProps;

const defaultModalCloseIcon = <XIcon aria-hidden="true" />;

/** Título semântico que nomeia o diálogo pelo slot `title` do React Aria. */
export function ModalTitle({ children, className, ...props }: ModalTitleProps) {
  return (
    <AriaHeading
      {...props}
      className={twMerge("m-0 text-title text-foreground", className)}
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
      className={twMerge("m-0 text-body text-muted", className)}
      data-slot="modal-description"
      elementType="p"
      slot="description"
    >
      {children}
    </AriaText>
  );
}

/** Botão de fechamento interno ao ModalHeader. Use a prop `showClose` do cabeçalho. */
function ModalClose({
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
      twMerge(
        "absolute top-modal-mobile-inset-top right-modal-mobile-inset-right shrink-0 [--button-height:var(--spacing-8)]! md:top-modal md:right-modal",
        userClassName,
      ) ?? "",
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

/**
 * Cabeçalho do Modal: título à esquerda, descrição abaixo e botão de fechamento à direita. Ganha
 * uma linha de ponta a ponta abaixo quando há um ModalBody.
 */
export function ModalHeader({
  children,
  className,
  closeLabel,
  showClose = true,
  ...props
}: ModalHeaderProps) {
  return (
    <div
      {...props}
      data-slot="modal-header"
      className={twMerge(
        "group/modal-header relative flex min-w-0 shrink-0 flex-col gap-1 pt-modal-mobile-inset-top pr-modal-mobile-inset-right pl-modal-mobile-inset-left text-left md:pt-modal md:pr-modal md:pl-modal group-has-[[data-slot=modal-body]]/modal:border-b group-has-[[data-slot=modal-body]]/modal:border-border pb-4 group-has-[[data-slot=modal-close]]/modal-header:pr-16",
        className,
      )}
    >
      {children}
      {showClose && <ModalClose aria-label={closeLabel} />}
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
        "flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto overscroll-contain py-4 pl-modal-mobile-inset-left pr-modal-mobile-inset-right md:px-modal",
        className,
      )}
    />
  );
}

/**
 * Área de ações do Modal. Por padrão empilha no celular e alinha à direita a partir de `md`. Ganha
 * uma linha de ponta a ponta acima quando há um ModalBody. Os botões são do consumidor.
 */
export function ModalFooter({ className, ...props }: ModalFooterProps) {
  return (
    <div
      {...props}
      data-slot="modal-footer"
      className={twMerge(
        "flex min-w-0 shrink-0 flex-col gap-2 pb-modal-mobile-inset-bottom pl-modal-mobile-inset-left pr-modal-mobile-inset-right md:flex-row md:justify-end md:px-modal md:pb-modal group-has-[[data-slot=modal-body]]/modal:border-t group-has-[[data-slot=modal-body]]/modal:border-border pt-4",
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
 * enquanto está aberto e restaura o foco ao elemento que o abriu ao ser fechado. A rolagem do
 * conteúdo fica restrita ao ModalBody.
 */
export function Modal({
  "aria-describedby": ariaDescribedby,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  children,
  className,
  defaultOpen,
  id,
  initialFocus,
  isDismissable = false,
  isKeyboardDismissDisabled = false,
  isOpen,
  onOpenChange,
  ref,
  role = "dialog",
  shouldCloseOnInteractOutside,
  size = "md",
  ...overlayProps
}: Readonly<ModalProps>) {
  const presentation = role === "dialog" && size !== "sm" ? "fullScreen" : "card";

  useLayoutEffect(() => {
    const shouldFocus = isOpen === true || (isOpen === undefined && defaultOpen === true);

    if (shouldFocus) {
      initialFocus?.current?.focus();
    }
  }, [defaultOpen, initialFocus, isOpen]);

  return (
    <AriaModalOverlay
      {...overlayProps}
      className={({ isEntering, isExiting }) =>
        overlayStyles({ isEntering, isExiting, presentation })
      }
      data-slot="modal-overlay"
      defaultOpen={defaultOpen}
      isDismissable={isDismissable}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      shouldCloseOnInteractOutside={shouldCloseOnInteractOutside}
    >
      <AriaModal
        className={modalStyles({ className, presentation, size })}
        data-size={size}
        data-slot="modal"
        ref={ref}
      >
        <AriaDialog
          aria-describedby={ariaDescribedby}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
          className="flex min-h-0 min-w-0 flex-1 flex-col outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          id={id}
          role={role}
        >
          {children}
        </AriaDialog>
      </AriaModal>
    </AriaModalOverlay>
  );
}

export type DiscardChangesModalProps = {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/** Confirma o descarte de dados preenchidos antes de fechar um formulário. */
export function DiscardChangesModal({ isOpen, onCancel, onConfirm }: DiscardChangesModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal
      initialFocus={cancelButtonRef}
      isDismissable
      isKeyboardDismissDisabled={false}
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onCancel();
        }
      }}
      role="alertdialog"
      size="sm"
    >
      <ModalHeader>
        <ModalTitle>Descartar alterações?</ModalTitle>
        <ModalDescription>Fechar agora apagará os dados preenchidos.</ModalDescription>
      </ModalHeader>
      <ModalBody>
        <p className="m-0 text-body text-muted">
          Você pode cancelar e continuar editando ou descartar este formulário.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button
          ref={cancelButtonRef}
          onPress={onCancel}
          size="sm"
          type="button"
          variant="secondary"
        >
          Continuar editando
        </Button>
        <Button onPress={onConfirm} size="sm" type="button" variant="danger">
          Descartar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
