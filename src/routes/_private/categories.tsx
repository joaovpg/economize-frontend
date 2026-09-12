import { useState } from "react";
import {
  Button as AriaButton,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  Switch,
} from "react-aria-components";
import { Controller, useForm, type Control, type UseFormSetError } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { cn } from "tailwind-variants";
import { z } from "zod";

import { Button } from "../../components/Button";
import { Card, CardBody, CardHeader } from "../../components/Card";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../../components/Modal";
import { TextField } from "../../components/TextField";
import { isApiError } from "../../lib/api-errors";
import { buildCategoryTree, type CategoryTreeNode } from "../../lib/category-tree";
import { getCategorias, postCategoria, putCategoria } from "../../services/categories/api";
import { type CategoriaResponse } from "../../services/categories/contracts";

const ROOT_CATEGORY_KEY = "__root__";

const categoryFormSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome da categoria."),
  categoriaPaiId: z.uuid().nullable(),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;

type CategoryNode = CategoryTreeNode<CategoriaResponse>;

type CategoryEditorValue = CategoriaResponse | null | undefined;

type PendingCategoryToggle = {
  category: CategoriaResponse;
  nextActive: boolean;
};

function normalizeCategorySearch(value: string) {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function filterCategoryTree(tree: readonly CategoryNode[], query: string): CategoryNode[] {
  const normalizedQuery = normalizeCategorySearch(query);

  if (normalizedQuery.length === 0) {
    return [...tree];
  }

  const filterNode = (node: CategoryNode): CategoryNode | null => {
    const children = node.children
      .map(filterNode)
      .filter((child): child is CategoryNode => child !== null);
    const matches = normalizeCategorySearch(node.nome).includes(normalizedQuery);

    if (!matches && children.length === 0) {
      return null;
    }

    return { ...node, children };
  };

  return tree.map(filterNode).filter((node): node is CategoryNode => node !== null);
}

function countCategoryTreeNodes(tree: readonly CategoryNode[]): number {
  return tree.reduce((count, node) => count + 1 + countCategoryTreeNodes(node.children), 0);
}

function getCategoryDescendantIds(categories: readonly CategoriaResponse[], categoryId: string) {
  const childrenByParentId = new Map<string, string[]>();

  for (const category of categories) {
    if (category.categoriaPaiId === null) {
      continue;
    }

    const children = childrenByParentId.get(category.categoriaPaiId) ?? [];
    children.push(category.id);
    childrenByParentId.set(category.categoriaPaiId, children);
  }

  const descendants = new Set<string>();
  const pendingIds = [categoryId];

  while (pendingIds.length > 0) {
    const parentId = pendingIds.pop();

    if (!parentId) {
      continue;
    }

    for (const childId of childrenByParentId.get(parentId) ?? []) {
      if (descendants.has(childId)) {
        continue;
      }

      descendants.add(childId);
      pendingIds.push(childId);
    }
  }

  return descendants;
}

function getCategoryParentOptions(
  categories: readonly CategoriaResponse[],
  editingCategory: CategoriaResponse | null,
) {
  const excludedIds = new Set<string>();
  const currentParentId = editingCategory?.categoriaPaiId ?? null;

  if (editingCategory) {
    excludedIds.add(editingCategory.id);

    for (const descendantId of getCategoryDescendantIds(categories, editingCategory.id)) {
      excludedIds.add(descendantId);
    }
  }

  const options: { id: string; isDisabled: boolean; label: string }[] = [];
  const appendOptions = (nodes: readonly CategoryNode[], depth: number) => {
    for (const node of nodes) {
      if (!excludedIds.has(node.id) && (node.ativo || node.id === currentParentId)) {
        options.push({
          id: node.id,
          isDisabled: !node.ativo,
          label: `${"— ".repeat(depth)}${node.nome}${node.ativo ? "" : " (inativa)"}`,
        });
      }

      appendOptions(node.children, depth + 1);
    }
  };

  appendOptions(buildCategoryTree(categories), 0);

  return options;
}

function getCategoryFormField(field: string | undefined): keyof CategoryFormData | null {
  const fieldName = field?.split("#").pop()?.split("/").pop();

  return fieldName === "nome" || fieldName === "categoriaPaiId" ? fieldName : null;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (!isApiError(error)) {
    return fallback;
  }

  return error.problem?.detail ?? error.message ?? fallback;
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

type CategoryParentFieldProps = {
  categories: readonly CategoriaResponse[];
  control: Control<CategoryFormData>;
  editingCategory: CategoriaResponse | null;
  errorMessage?: string;
  isDisabled: boolean;
};

function CategoryParentField({
  categories,
  control,
  editingCategory,
  errorMessage,
  isDisabled,
}: CategoryParentFieldProps) {
  const options = getCategoryParentOptions(categories, editingCategory);

  return (
    <Controller
      control={control}
      name="categoriaPaiId"
      render={({ field }) => (
        <Select
          aria-label="Categoria-pai"
          className="grid min-w-0 gap-1"
          isDisabled={isDisabled}
          isInvalid={Boolean(errorMessage)}
          onBlur={field.onBlur}
          onSelectionChange={(key) => {
            field.onChange(key === ROOT_CATEGORY_KEY ? null : String(key));
          }}
          selectedKey={field.value ?? ROOT_CATEGORY_KEY}
        >
          <Label className="text-label text-foreground">Categoria-pai</Label>
          <AriaButton className="flex min-h-12 w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-surface px-3.5 text-body-small text-foreground transition-[background-color,border-color,outline-color] duration-150 ease-out outline-none hover:border-border-strong focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-brand data-disabled:cursor-not-allowed data-disabled:bg-surface-muted data-disabled:text-subtle">
            <SelectValue className="min-w-0 flex-1 truncate text-left" />
            <CaretDownIcon aria-hidden="true" className="size-4 shrink-0 text-subtle" />
          </AriaButton>
          <div className="min-h-4">
            {errorMessage && (
              <FieldError className="block min-h-4 text-validation text-danger">
                {errorMessage}
              </FieldError>
            )}
          </div>
          <Popover className="z-10 min-w-60 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-popover">
            <ListBox
              aria-label="Categorias-pai disponíveis"
              className="grid max-h-60 gap-0.5 overflow-auto p-0 outline-none"
            >
              <ListBoxItem
                className="cursor-pointer rounded-lg px-3 py-2 text-body-small text-foreground outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focused:bg-surface-muted data-selected:bg-brand-soft data-selected:text-brand-hover"
                id={ROOT_CATEGORY_KEY}
                textValue="Categoria raiz"
              >
                Categoria raiz
              </ListBoxItem>
              {options.map((option) => (
                <ListBoxItem
                  className="cursor-pointer rounded-lg px-3 py-2 text-body-small text-foreground outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focused:bg-surface-muted data-selected:bg-brand-soft data-selected:text-brand-hover"
                  id={option.id}
                  isDisabled={option.isDisabled}
                  key={option.id}
                  textValue={option.label}
                >
                  {option.label}
                </ListBoxItem>
              ))}
            </ListBox>
          </Popover>
        </Select>
      )}
    />
  );
}

type CategoryTreeNodeProps = {
  node: CategoryNode;
  onEdit: (category: CategoriaResponse) => void;
  onToggle: (category: CategoriaResponse, nextActive: boolean) => void;
  pendingCategoryId: string | null;
};

function CategoryTreeNode({ node, onEdit, onToggle, pendingCategoryId }: CategoryTreeNodeProps) {
  const isPending = pendingCategoryId === node.id;

  return (
    <li className="grid min-w-0 gap-2">
      <div
        className={cn(
          "flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-[color-mix(in_oklch,var(--color-surface)_58%,transparent)] px-3 py-2.5 transition-[background-color,border-color] duration-150 ease-out hover:border-border-strong hover:bg-surface-muted",
          !node.ativo && "bg-surface-muted/55",
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className={cn(
              "size-2.5 shrink-0 rounded-full bg-brand",
              !node.ativo && "bg-border-strong",
            )}
          />
          <div className="grid min-w-0 gap-1">
            <span className="truncate text-label text-foreground">{node.nome}</span>
            <span className="flex flex-wrap items-center gap-2 text-caption text-subtle">
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-caption-strong",
                  node.ativo
                    ? "border-success/25 bg-success-soft text-success"
                    : "border-border bg-surface text-muted",
                )}
              >
                {node.ativo ? "Ativa" : "Inativa"}
              </span>
              {node.children.length > 0 && (
                <span>
                  {node.children.length} {node.children.length === 1 ? "filha" : "filhas"}
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            aria-label={`Editar categoria ${node.nome}`}
            className="size-9! min-h-9! rounded-lg!"
            isDisabled={pendingCategoryId !== null}
            isIconOnly
            onPress={() => onEdit(node)}
            size="sm"
            variant="ghost"
          >
            <PencilSimpleIcon aria-hidden="true" />
          </Button>
          <Switch
            aria-label={`${node.ativo ? "Inativar" : "Ativar"} categoria ${node.nome}`}
            className="group inline-flex min-h-9 cursor-pointer items-center rounded-lg p-1 transition-[background-color] outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focus-visible:bg-surface-muted"
            isDisabled={pendingCategoryId !== null}
            isSelected={node.ativo}
            onChange={(nextActive) => onToggle(node, nextActive)}
          >
            <span className="relative block h-5 w-9 rounded-full bg-border-strong transition-[background-color] duration-150 ease-out group-data-selected:bg-brand motion-reduce:transition-none">
              <span className="absolute top-0.5 left-0.5 block size-4 rounded-full bg-surface shadow-[0_1px_2px_rgb(15_23_42/0.18)] transition-transform duration-150 ease-out group-data-selected:translate-x-4 motion-reduce:transition-none" />
            </span>
          </Switch>
          {isPending && <span className="sr-only">Salvando alteração</span>}
        </div>
      </div>
      {node.children.length > 0 && (
        <ul className="ml-4 grid list-none gap-2 border-l border-border pl-3">
          {node.children.map((child) => (
            <CategoryTreeNode
              key={child.id}
              node={child}
              onEdit={onEdit}
              onToggle={onToggle}
              pendingCategoryId={pendingCategoryId}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

type CategoryManagementTreeProps = {
  categories: readonly CategoriaResponse[];
  onEdit: (category: CategoriaResponse) => void;
  onToggle: (category: CategoriaResponse, nextActive: boolean) => void;
  pendingCategoryId: string | null;
  searchQuery: string;
};

function CategoryManagementTree({
  categories,
  onEdit,
  onToggle,
  pendingCategoryId,
  searchQuery,
}: CategoryManagementTreeProps) {
  const tree = filterCategoryTree(buildCategoryTree(categories), searchQuery);
  const filteredCategoryCount = countCategoryTreeNodes(tree);
  const hasSearch = normalizeCategorySearch(searchQuery).length > 0;
  const resultMessage = hasSearch
    ? `${filteredCategoryCount} ${filteredCategoryCount === 1 ? "categoria encontrada" : "categorias encontradas"}.`
    : `${filteredCategoryCount} ${filteredCategoryCount === 1 ? "categoria exibida" : "categorias exibidas"}.`;

  return (
    <>
      <output aria-live="polite" className="sr-only">
        {resultMessage}
      </output>
      {tree.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-strong p-4 text-body-small text-muted">
          {hasSearch ? "Nenhuma categoria encontrada." : "Nenhuma categoria cadastrada."}
        </p>
      ) : (
        <ul aria-label="Categorias cadastradas" className="m-0 grid list-none gap-2 p-0">
          {tree.map((node) => (
            <CategoryTreeNode
              key={node.id}
              node={node}
              onEdit={onEdit}
              onToggle={onToggle}
              pendingCategoryId={pendingCategoryId}
            />
          ))}
        </ul>
      )}
    </>
  );
}

type CategoryEditorModalProps = {
  categories: readonly CategoriaResponse[];
  category: CategoriaResponse | null;
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
};

function CategoryEditorModal({ categories, category, onClose, onSaved }: CategoryEditorModalProps) {
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
              className="m-0 block rounded-xl border border-danger/25 bg-danger-soft px-3.5 py-3 text-body-small text-danger"
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

type CategoryToggleConfirmationProps = {
  errorMessage: string | null;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  pendingToggle: PendingCategoryToggle | null;
};

function CategoryToggleConfirmation({
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
        <p className="m-0 text-body-small text-muted" id="category-toggle-description">
          “{pendingToggle.category.nome}” deixará de aparecer nos filtros e nos novos cadastros de
          transações. As transações existentes serão preservadas.
        </p>
        {errorMessage && (
          <p
            aria-live="assertive"
            className="m-0 block rounded-xl border border-danger/25 bg-danger-soft px-3.5 py-3 text-body-small text-danger"
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

function CategoriesPage() {
  const categories = Route.useLoaderData();
  const router = useRouter();
  const [editorCategory, setEditorCategory] = useState<CategoryEditorValue>(undefined);
  const [categorySearch, setCategorySearch] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);
  const [pendingToggle, setPendingToggle] = useState<PendingCategoryToggle | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const activeCategoryCount = categories.filter((category) => category.ativo).length;
  const inactiveCategoryCount = categories.length - activeCategoryCount;

  const handleRefreshAfterMutation = async (message: string) => {
    try {
      await router.invalidate({ sync: true });
      setFeedback(message);
      setRefreshError(null);
    } catch {
      setFeedback(null);
      setRefreshError(
        "A alteração foi salva, mas não foi possível atualizar a lista. Recarregue a página.",
      );
    }
  };

  const commitCategoryToggle = async ({ category, nextActive }: PendingCategoryToggle) => {
    if (pendingCategoryId !== null) {
      return;
    }

    setFeedback(null);
    setRefreshError(null);
    setToggleError(null);
    setPendingCategoryId(category.id);

    try {
      await putCategoria(category.id, {
        ativo: nextActive,
        categoriaPaiId: category.categoriaPaiId,
        nome: category.nome,
      });
    } catch (error) {
      setToggleError(
        getErrorMessage(
          error,
          nextActive
            ? "Não foi possível ativar a categoria. Tente novamente."
            : "Não foi possível inativar a categoria. Tente novamente.",
        ),
      );
      setPendingCategoryId(null);
      return;
    }

    setPendingToggle(null);

    try {
      await router.invalidate({ sync: true });
      setFeedback(
        nextActive ? "Categoria ativada com sucesso." : "Categoria inativada com sucesso.",
      );
    } catch {
      setRefreshError(
        "A alteração foi salva, mas não foi possível atualizar a lista. Recarregue a página.",
      );
    }

    setPendingCategoryId(null);
  };

  const handleCategoryToggle = (category: CategoriaResponse, nextActive: boolean) => {
    if (pendingCategoryId !== null) {
      return;
    }

    setFeedback(null);
    setRefreshError(null);
    setToggleError(null);

    if (!nextActive) {
      setPendingToggle({ category, nextActive });
      return;
    }

    void commitCategoryToggle({ category, nextActive });
  };

  const handleEdit = (category: CategoriaResponse) => {
    setFeedback(null);
    setRefreshError(null);
    setToggleError(null);
    setEditorCategory(category);
  };

  const handleOpenCreate = () => {
    setFeedback(null);
    setRefreshError(null);
    setToggleError(null);
    setEditorCategory(null);
  };

  const handleBack = () => {
    if (router.history.canGoBack()) {
      router.history.back();
      return;
    }

    void router.navigate({ to: "/summary" });
  };

  return (
    <main
      aria-labelledby="categories-title"
      className="min-w-0 p-[2rem_1.75rem_2.5rem] max-[48rem]:p-[1.5rem_1rem_2rem]"
    >
      <div className="mx-auto grid max-w-5xl gap-5.5">
        <Button
          className="justify-self-start text-caption"
          leadingIcon={<ArrowLeftIcon aria-hidden="true" />}
          onPress={handleBack}
          size="sm"
          variant="link"
        >
          Voltar ao resumo
        </Button>

        <header className="flex items-end justify-between gap-5 max-[40rem]:grid max-[40rem]:items-start max-[40rem]:gap-4">
          <div className="grid min-w-0 gap-2.5">
            <h1 className="m-0 text-page-title" id="categories-title">
              Categorias
            </h1>
            <p className="m-0 max-w-[48ch] text-body-small text-muted">
              Organize a forma como suas transações aparecem no Economize.
            </p>
          </div>
          <Button
            isDisabled={pendingCategoryId !== null}
            leadingIcon={<PlusIcon aria-hidden="true" />}
            onPress={handleOpenCreate}
            size="sm"
          >
            Nova categoria
          </Button>
        </header>

        {feedback && (
          <output
            aria-live="polite"
            className="m-0 block rounded-xl border border-success/25 bg-success-soft px-3.5 py-3 text-body-small text-success"
          >
            {feedback}
          </output>
        )}
        {refreshError && (
          <p
            aria-live="assertive"
            className="m-0 block rounded-xl border border-danger/25 bg-danger-soft px-3.5 py-3 text-body-small text-danger"
            role="alert"
          >
            {refreshError}
          </p>
        )}
        {toggleError && !pendingToggle && (
          <p
            aria-live="assertive"
            className="m-0 block rounded-xl border border-danger/25 bg-danger-soft px-3.5 py-3 text-body-small text-danger"
            role="alert"
          >
            {toggleError}
          </p>
        )}

        <Card as="section" aria-labelledby="categories-list-title" className="gap-0">
          <CardHeader className="grid items-start gap-3.5 md:flex md:items-end">
            <div className="grid min-w-0 gap-1.5">
              <h2 className="m-0 text-title-compact text-foreground" id="categories-list-title">
                Suas categorias
              </h2>
              <p className="m-0 text-caption text-muted">
                Categorias inativas podem ser reativadas quando necessário.
              </p>
            </div>
            <div className="flex min-w-0 items-end justify-end gap-3 max-[40rem]:grid max-[40rem]:items-start">
              <div className="w-full max-w-88 min-w-0 max-[40rem]:max-w-none">
                <TextField
                  label="Pesquisar categoria"
                  leadingIcon={<MagnifyingGlassIcon aria-hidden="true" />}
                  onChange={setCategorySearch}
                  placeholder="Nome da categoria"
                  type="search"
                  value={categorySearch}
                />
              </div>
              <span className="shrink-0 text-caption text-subtle">
                {activeCategoryCount} ativas · {inactiveCategoryCount} inativas
              </span>
            </div>
          </CardHeader>
          <CardBody>
            <CategoryManagementTree
              categories={categories}
              onEdit={handleEdit}
              onToggle={handleCategoryToggle}
              pendingCategoryId={pendingCategoryId}
              searchQuery={categorySearch}
            />
          </CardBody>
        </Card>
      </div>

      {editorCategory !== undefined && (
        <CategoryEditorModal
          categories={categories}
          category={editorCategory}
          onClose={() => setEditorCategory(undefined)}
          onSaved={handleRefreshAfterMutation}
        />
      )}
      <CategoryToggleConfirmation
        errorMessage={toggleError}
        isPending={pendingCategoryId !== null}
        onCancel={() => {
          if (pendingCategoryId === null) {
            setPendingToggle(null);
            setToggleError(null);
          }
        }}
        onConfirm={() => {
          if (pendingToggle) {
            void commitCategoryToggle(pendingToggle);
          }
        }}
        pendingToggle={pendingToggle}
      />
    </main>
  );
}

export const Route = createFileRoute("/_private/categories")({
  loader: ({ abortController }) => getCategorias({ signal: abortController.signal }),
  component: CategoriesPage,
});
