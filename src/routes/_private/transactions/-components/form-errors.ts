import { type FieldValues, type Path, type UseFormSetError } from "react-hook-form";

import { isApiError } from "../../../../lib/api-errors";

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
      setError(field, { type: "server", message });
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
