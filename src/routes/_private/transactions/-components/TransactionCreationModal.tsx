import { useCallback, useState } from "react";

import { Modal, ModalHeader } from "../../../../components/Modal";
import { type ContaResponse } from "../../../../services/accounts/contracts";
import { type CategoriaResponse } from "../../../../services/categories/contracts";
import { DiscardChangesModal, type DiscardAction } from "./DiscardChangesModal";
import { InstallmentForm } from "./InstallmentForm";
import { RecurrenceForm } from "./RecurrenceForm";
import {
  getInitialEntryDate,
  transactionEntryModeOptions,
  type TransactionEntryMode,
} from "./transaction-form";
import { TransactionForm } from "./TransactionForm";
import { TransferForm } from "./TransferForm";

type TransactionCreationModalProps = {
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
  selectedMonth: Parameters<typeof getInitialEntryDate>[0];
};

type FormState = {
  isDirty: boolean;
  isSubmitting: boolean;
};

const cleanFormState: FormState = { isDirty: false, isSubmitting: false };

export function TransactionCreationModal({
  accounts,
  categories,
  onClose,
  onSaved,
  selectedMonth,
}: TransactionCreationModalProps) {
  const [mode, setMode] = useState<TransactionEntryMode>("transaction");
  const [discardAction, setDiscardAction] = useState<DiscardAction>(null);
  const [formState, setFormState] = useState<FormState>(cleanFormState);

  const handleFormStateChange = useCallback((nextState: FormState) => {
    setFormState(nextState);
  }, []);

  const requestClose = useCallback(() => {
    if (formState.isSubmitting) {
      return;
    }

    if (formState.isDirty) {
      setDiscardAction({ kind: "close" });
      return;
    }

    onClose();
  }, [formState.isDirty, formState.isSubmitting, onClose]);

  const requestModeChange = useCallback(
    (nextMode: TransactionEntryMode) => {
      if (nextMode === mode || formState.isSubmitting) {
        return;
      }

      if (formState.isDirty) {
        setDiscardAction({ kind: "mode", mode: nextMode });
        return;
      }

      setFormState(cleanFormState);
      setMode(nextMode);
    },
    [formState.isDirty, formState.isSubmitting, mode],
  );

  const handleDiscardCancel = useCallback(() => {
    setDiscardAction(null);
  }, []);

  const handleDiscardConfirm = useCallback(() => {
    if (!discardAction) {
      return;
    }

    setDiscardAction(null);
    setFormState(cleanFormState);

    if (discardAction.kind === "close") {
      onClose();
      return;
    }

    setMode(discardAction.mode);
  }, [discardAction, onClose]);

  const selectedMode = transactionEntryModeOptions.find((option) => option.value === mode);

  return (
    <>
      <Modal
        description={selectedMode?.description}
        isDismissable={!formState.isSubmitting && discardAction === null}
        isKeyboardDismissDisabled={formState.isSubmitting}
        isOpen
        onOpenChange={(open) => {
          if (!open) {
            requestClose();
          }
        }}
        showCloseButton={!formState.isSubmitting && discardAction === null}
        size="lg"
        title="Nova movimentação"
      >
        <ModalHeader />
        {mode === "transaction" && (
          <TransactionForm
            accounts={accounts}
            categories={categories}
            mode={mode}
            onClose={requestClose}
            onFormStateChange={handleFormStateChange}
            onModeChange={requestModeChange}
            onSaved={onSaved}
            selectedMonth={selectedMonth}
          />
        )}
        {mode === "transfer" && (
          <TransferForm
            accounts={accounts}
            mode={mode}
            onClose={requestClose}
            onFormStateChange={handleFormStateChange}
            onModeChange={requestModeChange}
            onSaved={onSaved}
            selectedMonth={selectedMonth}
          />
        )}
        {mode === "recurrence" && (
          <RecurrenceForm
            accounts={accounts}
            categories={categories}
            mode={mode}
            onClose={requestClose}
            onFormStateChange={handleFormStateChange}
            onModeChange={requestModeChange}
            onSaved={onSaved}
            selectedMonth={selectedMonth}
          />
        )}
        {mode === "installment" && (
          <InstallmentForm
            accounts={accounts}
            categories={categories}
            mode={mode}
            onClose={requestClose}
            onFormStateChange={handleFormStateChange}
            onModeChange={requestModeChange}
            onSaved={onSaved}
            selectedMonth={selectedMonth}
          />
        )}
      </Modal>
      <DiscardChangesModal
        action={discardAction}
        onCancel={handleDiscardCancel}
        onConfirm={handleDiscardConfirm}
      />
    </>
  );
}
