import { Button } from "../../../../components/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../../../../components/Modal";

import type { PendingCategoryToggle } from "./category-types";

type CategoryToggleConfirmationProps = {
  errorMessage: string | null;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  pendingToggle: PendingCategoryToggle | null;
};

export function CategoryToggleConfirmation({
  errorMessage,
  isPending,
  onCancel,
  onConfirm,
  pendingToggle,
}: CategoryToggleConfirmationProps) {
  if (!pendingToggle) {
    return null;
  }

  return (
    <Modal
      aria-describedby="category-toggle-description"
      isDismissable={!isPending}
      isKeyboardDismissDisabled={isPending}
      isOpen
      onOpenChange={(open) => {
        if (!open && !isPending) {
          onCancel();
        }
      }}
      role="alertdialog"
      showCloseButton={!isPending}
      size="sm"
      title="Inativar categoria?"
    >
      <ModalHeader />
      <ModalBody>
        <p className="text-body-small text-muted" id="category-toggle-description">
          “{pendingToggle.category.nome}” deixará de aparecer nos filtros e nos novos cadastros de
          transações. As transações existentes serão preservadas.
        </p>
        {errorMessage && (
          <p
            aria-live="assertive"
            className="block rounded-xl border border-danger/25 bg-danger-soft px-3.5 py-3 text-body-small text-danger"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
      </ModalBody>
      <ModalFooter>
        <Button isDisabled={isPending} onPress={onCancel} size="sm" variant="secondary">
          Cancelar
        </Button>
        <Button
          isDisabled={isPending}
          isPending={isPending}
          onPress={onConfirm}
          size="sm"
          variant="danger"
        >
          Inativar
        </Button>
      </ModalFooter>
    </Modal>
  );
}
