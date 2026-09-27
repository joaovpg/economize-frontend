import { useRef } from "react";

import { Button } from "../../../../components/Button";
import { InlineMessage } from "../../../../components/InlineMessage";
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "../../../../components/Modal";

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
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  if (!pendingToggle) {
    return null;
  }

  return (
    <Modal
      isDismissable={!isPending}
      isKeyboardDismissDisabled={isPending}
      isOpen
      initialFocus={cancelButtonRef}
      onOpenChange={(open) => {
        if (!open && !isPending) {
          onCancel();
        }
      }}
      role="alertdialog"
      size="sm"
    >
      <ModalHeader>
        <ModalTitle>Inativar categoria?</ModalTitle>
        <ModalDescription>
          “{pendingToggle.category.nome}” deixará de aparecer nos filtros e nos novos cadastros de
          transações. As transações existentes serão preservadas.
        </ModalDescription>
        {!isPending && <ModalClose />}
      </ModalHeader>
      {errorMessage && (
        <ModalBody>
          <InlineMessage tone="danger">{errorMessage}</InlineMessage>
        </ModalBody>
      )}
      <ModalFooter>
        <Button
          ref={cancelButtonRef}
          isDisabled={isPending}
          onPress={onCancel}
          size="sm"
          variant="secondary"
        >
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
