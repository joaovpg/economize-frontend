import { type ComponentProps, type ReactNode } from "react";

import { Button } from "../../../../components/Button";
import { ModalBody, ModalFooter } from "../../../../components/Modal";
import { Select, SelectItem } from "../../../../components/Select";
import { transactionEntryModeOptions, type TransactionEntryMode } from "./transaction-form";

type TransactionFormShellProps = {
  children: ReactNode;
  formId: string;
  isDisabled?: boolean;
  isSubmitting: boolean;
  mode: TransactionEntryMode;
  onClose: () => void;
  onModeChange: (mode: TransactionEntryMode) => void;
  onSubmit: NonNullable<ComponentProps<"form">["onSubmit"]>;
  showModeSelector?: boolean;
  submitLabel: string;
};

export function TransactionFormShell({
  children,
  formId,
  isDisabled = false,
  isSubmitting,
  mode,
  onClose,
  onModeChange,
  onSubmit,
  showModeSelector = true,
  submitLabel,
}: TransactionFormShellProps) {
  const selectedMode = transactionEntryModeOptions.find((option) => option.value === mode);

  return (
    <form className="contents" id={formId} noValidate onSubmit={onSubmit}>
      <ModalBody>
        {showModeSelector && (
          <div className="grid gap-1.5">
            <Select
              isDisabled={isDisabled || isSubmitting}
              label="Tipo de movimentação"
              onChange={(nextValue) => {
                const nextMode = transactionEntryModeOptions.find(
                  (option) => option.value === String(nextValue),
                )?.value;

                if (nextMode) {
                  onModeChange(nextMode);
                }
              }}
              value={mode}
            >
              {transactionEntryModeOptions.map((option) => (
                <SelectItem id={option.value} key={option.value} textValue={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            <p className="m-0 text-caption text-muted">{selectedMode?.description}</p>
          </div>
        )}

        {children}
      </ModalBody>
      <ModalFooter>
        <Button
          isDisabled={isSubmitting}
          onPress={onClose}
          size="sm"
          type="button"
          variant="secondary"
        >
          Cancelar
        </Button>
        <Button
          form={formId}
          isDisabled={isDisabled || isSubmitting}
          isPending={isSubmitting}
          size="sm"
          type="submit"
        >
          {submitLabel}
        </Button>
      </ModalFooter>
    </form>
  );
}
