import { Button } from "../../../../components/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../../../../components/Modal";
import { getEntryModeLabel, type TransactionEntryMode } from "./transaction-form";

export type DiscardAction = { kind: "close" } | { kind: "mode"; mode: TransactionEntryMode } | null;

type DiscardChangesModalProps = {
  action: DiscardAction;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DiscardChangesModal({ action, onCancel, onConfirm }: DiscardChangesModalProps) {
  const description =
    action?.kind === "mode"
      ? `Trocar para ${getEntryModeLabel(action.mode).toLocaleLowerCase("pt-BR")} apagará os dados preenchidos.`
      : "Fechar agora apagará os dados preenchidos.";

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
      title="Descartar alterações?"
      description={description}
    >
      <ModalHeader />
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
