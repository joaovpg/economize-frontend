import { Button } from "../../../../components/Button";
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "../../../../components/Modal";

export type DiscardAction = { kind: "close" } | null;

type DiscardChangesModalProps = {
  action: DiscardAction;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DiscardChangesModal({ action, onCancel, onConfirm }: DiscardChangesModalProps) {
  const description = "Fechar agora apagará os dados preenchidos.";

  return (
    <Modal
      isDismissable
      isKeyboardDismissDisabled={false}
      isOpen={action !== null}
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
        <ModalDescription>{description}</ModalDescription>
        <ModalClose />
      </ModalHeader>
      <ModalBody>
        <p className="m-0 text-body-small text-muted">
          Você pode cancelar e continuar editando ou descartar este formulário.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button onPress={onCancel} size="sm" type="button" variant="secondary">
          Continuar editando
        </Button>
        <Button onPress={onConfirm} size="sm" type="button" variant="danger">
          Descartar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
