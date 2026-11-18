import { type FieldValues, type Path, type UseFormSetError } from "react-hook-form";

import { isApiError } from "../../../../lib/api-errors";

/**
 * Conflito de versão ou lançamento inexistente: a listagem precisa ser consultada de novo. O modal
 * continua aberto e nada é reenviado automaticamente.
 */
export function isStaleTransactionError(error: unknown) {
  return (
    isApiError(error) &&
    (error.code === "VERSAO_DESATUALIZADA" || error.code === "RECURSO_NAO_ENCONTRADO")
  );
}

export function applyFormError<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  getField: (field: string) => Path<TFieldValues> | null,
  setSubmitError: (message: string) => void,
  fallback: string,
) {
  if (!isApiError(error)) {
    setSubmitError(fallback);
    return;
  }

  let hasFieldError = false;

  for (const [fieldName, messages] of Object.entries(error.fieldErrors)) {
    const field = getField(fieldName);
    const message = messages[0];

    if (field && message) {
      setError(field, { message, type: "server" });
      hasFieldError = true;
    }
  }

  if (!hasFieldError || error.problem?.detail) {
    setSubmitError(error.problem?.detail ?? error.message ?? fallback);
  }
}

export function getServerFieldName(field: string | undefined) {
  return field?.split("#").pop()?.split("/").pop();
}
