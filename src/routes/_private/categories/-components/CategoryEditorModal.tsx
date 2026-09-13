import { useState } from "react";
import { useForm, type UseFormSetError } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "../../../../components/Button";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../../../../components/Modal";
import { TextField } from "../../../../components/TextField";
import { isApiError } from "../../../../lib/api-errors";
import { postCategoria, putCategoria } from "../../../../services/categories/api";
import { categoryFormSchema, type CategoryFormData } from "./category-form";
import { CategoryParentField } from "./CategoryParentField";

import type { CategoriaResponse } from "../../../../services/categories/contracts";

function getCategoryFormField(field: string | undefined): keyof CategoryFormData | null {
  const fieldName = field?.split("#").pop()?.split("/").pop();

  return fieldName === "nome" || fieldName === "categoriaPaiId" ? fieldName : null;
}

function applyCategoryFormError(
  error: unknown,
  setError: UseFormSetError<CategoryFormData>,
  setSubmitError: (message: string) => void,
  fallback: string,
) {
  if (!isApiError(error)) {
    setSubmitError(fallback);
    return;
  }

  let hasFieldError = false;

  for (const [fieldName, messages] of Object.entries(error.fieldErrors)) {
    const field = getCategoryFormField(fieldName);
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

type CategoryEditorModalProps = {
  categories: readonly CategoriaResponse[];
  category: CategoriaResponse | null;
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
};

export function CategoryEditorModal({
  categories,
  category,
  onClose,
  onSaved,
}: CategoryEditorModalProps) {
  const isEditing = category !== null;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<CategoryFormData>({
    defaultValues: {
      categoriaPaiId: category?.categoriaPaiId ?? null,
      nome: category?.nome ?? "",
    },
    mode: "onSubmit",
    resolver: zodResolver(categoryFormSchema),
  });
  const nameField = register("nome");

  const handleFormSubmit = async (data: CategoryFormData) => {
    setSubmitError(null);
    let successMessage: string;

    try {
      if (category) {
        await putCategoria(category.id, {
          ativo: category.ativo,
          categoriaPaiId: data.categoriaPaiId,
          nome: data.nome.trim(),
        });
        successMessage = "Categoria atualizada com sucesso.";
      } else {
        await postCategoria({
          categoriaPaiId: data.categoriaPaiId,
          nome: data.nome.trim(),
        });
        successMessage = "Categoria criada com sucesso.";
      }
    } catch (error) {
      applyCategoryFormError(
        error,
        setError,
        setSubmitError,
        isEditing
          ? "Não foi possível atualizar a categoria. Tente novamente."
          : "Não foi possível cadastrar a categoria. Tente novamente.",
      );
      return;
    }

    onClose();
    void onSaved(successMessage);
  };

  return (
    <Modal
      isDismissable={!isSubmitting}
      isKeyboardDismissDisabled={isSubmitting}
      isOpen
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose();
        }
      }}
      showCloseButton={!isSubmitting}
      size="md"
      title={isEditing ? "Editar categoria" : "Nova categoria"}
      description={
        isEditing
          ? "Atualize o nome e a organização desta categoria."
          : "Crie uma categoria para organizar suas transações."
      }
    >
      <ModalHeader />
      <form
        className="contents"
        id="category-editor-form"
        noValidate
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <ModalBody>
          {submitError && (
            <p
              aria-live="assertive"
              className="block rounded-xl border border-danger/25 bg-danger-soft px-3.5 py-3 text-body-small text-danger"
              role="alert"
            >
              {submitError}
            </p>
          )}
          <TextField
            defaultValue={category?.nome ?? ""}
            errorMessage={errors.nome?.message}
            inputRef={nameField.ref}
            label="Nome"
            name={nameField.name}
            onBlur={nameField.onBlur}
            onInput={nameField.onChange}
            placeholder="Ex.: Moradia"
          />
          <CategoryParentField
            categories={categories}
            control={control}
            editingCategory={category}
            errorMessage={errors.categoriaPaiId?.message}
            isDisabled={isSubmitting}
          />
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
          <Button form="category-editor-form" isPending={isSubmitting} size="sm" type="submit">
            {isEditing ? "Salvar alterações" : "Cadastrar categoria"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
