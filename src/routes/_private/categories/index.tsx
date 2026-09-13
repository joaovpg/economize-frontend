import { useState } from "react";

import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { createFileRoute, useLoaderData, useRouter } from "@tanstack/react-router";

import { Button } from "../../../components/Button";
import { Card, CardBody, CardHeader } from "../../../components/Card";
import { Link } from "../../../components/Link";
import { TextField } from "../../../components/TextField";
import { isApiError } from "../../../lib/api-errors";
import { getCategorias, putCategoria } from "../../../services/categories/api";
import { type CategoriaResponse } from "../../../services/categories/contracts";
import { CategoryEditorModal } from "./-components/CategoryEditorModal";
import { CategoryManagementTree } from "./-components/CategoryManagementTree";
import { CategoryToggleConfirmation } from "./-components/CategoryToggleConfirmation";

import type { PendingCategoryToggle } from "./-components/category-types";

type CategoryEditorValue = CategoriaResponse | null | undefined;

function getErrorMessage(error: unknown, fallback: string) {
  if (!isApiError(error)) {
    return fallback;
  }

  return error.problem?.detail ?? error.message ?? fallback;
}

function CategoriesPage() {
  const categories = useLoaderData({ from: "/_private/categories/" });
  const activeCategoryCount = categories.filter((category) => category.ativo).length;
  const inactiveCategoryCount = categories.length - activeCategoryCount;
  const router = useRouter();

  const [editorCategory, setEditorCategory] = useState<CategoryEditorValue>(undefined);
  const [categorySearch, setCategorySearch] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);
  const [pendingToggle, setPendingToggle] = useState<PendingCategoryToggle | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

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

  return (
    <section
      aria-labelledby="categories-title"
      className="flex min-w-0 flex-col p-[2rem_1.75rem_2.5rem] max-[48rem]:p-[1.5rem_1rem_2rem]"
    >
      <div className="flex w-full max-w-5xl flex-col gap-5.5 self-center">
        <Link
          className="self-start text-caption"
          leadingIcon={<ArrowLeftIcon aria-hidden="true" />}
          to="/summary"
          size="sm"
          variant="link"
        >
          Voltar ao resumo
        </Link>

        <header className="flex items-end justify-between gap-5 max-[40rem]:flex-col max-[40rem]:items-start max-[40rem]:gap-4">
          <div className="flex min-w-0 flex-col gap-2.5">
            <h1 className="text-page-title" id="categories-title">
              Categorias
            </h1>
            <p className="max-w-[48ch] text-body-small text-muted">
              Organize a forma como suas transações aparecem no Economize.
            </p>
          </div>
          <Button
            className={"w-full md:w-auto"}
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
            className="block rounded-xl border border-success/25 bg-success-soft px-3.5 py-3 text-body-small text-success"
          >
            {feedback}
          </output>
        )}
        {refreshError && (
          <p
            aria-live="assertive"
            className="block rounded-xl border border-danger/25 bg-danger-soft px-3.5 py-3 text-body-small text-danger"
            role="alert"
          >
            {refreshError}
          </p>
        )}
        {toggleError && !pendingToggle && (
          <p
            aria-live="assertive"
            className="block rounded-xl border border-danger/25 bg-danger-soft px-3.5 py-3 text-body-small text-danger"
            role="alert"
          >
            {toggleError}
          </p>
        )}

        <Card as="section" aria-labelledby="categories-list-title">
          <CardHeader className="flex flex-col items-start gap-4">
            <TextField
              label="Pesquisar categoria"
              leadingIcon={<MagnifyingGlassIcon aria-hidden="true" />}
              onChange={setCategorySearch}
              placeholder="Nome da categoria"
              type="search"
              reserveErrorSpace={false}
              value={categorySearch}
            />
            <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:items-end">
              <div className="flex w-full min-w-0 flex-col gap-1.5 md:w-auto">
                <h2 className="text-title-compact text-foreground" id="categories-list-title">
                  Suas categorias
                </h2>
                <p className="text-caption text-muted">
                  Categorias inativas podem ser reativadas quando necessário.
                </p>
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
    </section>
  );
}

export const Route = createFileRoute("/_private/categories/")({
  loader: ({ abortController }) => getCategorias({ signal: abortController.signal }),
  component: CategoriesPage,
});
