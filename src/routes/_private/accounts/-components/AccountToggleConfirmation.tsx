import { useRef } from "react";

import { Button } from "../../../../components/Button";
import { InlineMessage } from "../../../../components/InlineMessage";
import {
  Modal,
  ModalBody,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "../../../../components/Modal";

import type { PendingAccountToggle } from "./account-types";

type AccountToggleConfirmationProps = {
  errorMessage: string | null;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  pendingToggle: PendingAccountToggle | null;
};

export function AccountToggleConfirmation({
  errorMessage,
  isPending,
  onCancel,
  onConfirm,
  pendingToggle,
}: AccountToggleConfirmationProps) {
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
      <ModalHeader showClose={!isPending}>
        <ModalTitle>Inativar conta?</ModalTitle>
        <ModalDescription>
          “{pendingToggle.account.nome}” não poderá receber novas transações. As transações
          existentes serão preservadas.
        </ModalDescription>
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
