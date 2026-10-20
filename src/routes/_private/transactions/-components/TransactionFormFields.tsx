import { RadioGroup, RadioItem } from "../../../../components/RadioGroup";
import { Select, SelectItem } from "../../../../components/Select";
import { buildCategoryTree, type CategoryTreeNode } from "../../../../lib/category-tree";
import { type ContaResponse } from "../../../../services/accounts/contracts";
import { type CategoriaResponse } from "../../../../services/categories/contracts";
import {
  type TransactionSituation,
  type TransactionType,
} from "../../../../services/transactions/shared";

const NO_ACCOUNT_OPTION = "__no_active_account__";
const NO_CATEGORY_OPTION = "__no_category__";

type AccountSelectProps = {
  accounts: readonly ContaResponse[];
  currency?: string;
  description?: string;
  errorMessage?: string;
  excludedAccountId?: string;
  includeSelectedInactive?: boolean;
  isDisabled?: boolean;
  label: string;
  name?: string;
  onBlur?: () => void;
  onChange: (value: string) => void;
  value?: string;
};

export function AccountSelect({
  accounts,
  currency,
  description,
  errorMessage,
  excludedAccountId,
  includeSelectedInactive = false,
  isDisabled = false,
  label,
  name,
  onBlur,
  onChange,
  value,
}: AccountSelectProps) {
  const options = accounts.filter(
    (account) =>
      (account.ativo || (includeSelectedInactive && account.id === value)) &&
      account.id !== excludedAccountId &&
      (currency === undefined || account.moeda === currency),
  );
  const hasOptions = options.length > 0;

  return (
    <Select
      className="min-w-0"
      description={description}
      errorMessage={errorMessage}
      isDisabled={isDisabled || !hasOptions}
      label={label}
      name={name}
      onBlur={onBlur}
      onChange={(nextValue) => onChange(nextValue === null ? "" : String(nextValue))}
      placeholder={hasOptions ? "Selecione uma conta" : "Nenhuma conta disponível"}
      value={value || null}
    >
      {hasOptions ? (
        options.map((account) => (
          <SelectItem
            id={account.id}
            key={account.id}
            textValue={`${account.nome} (${account.moeda})`}
          >
            <span className="flex min-w-0 items-center justify-between gap-3">
              <span className="truncate">{account.nome}</span>
              <span className="shrink-0 text-caption text-subtle">
                {account.moeda}
                {!account.ativo && " · inativa"}
              </span>
            </span>
          </SelectItem>
        ))
      ) : (
        <SelectItem id={NO_ACCOUNT_OPTION} isDisabled textValue="Nenhuma conta disponível">
          Nenhuma conta disponível
        </SelectItem>
      )}
    </Select>
  );
}

type CategorySelectProps = {
  categories: readonly CategoriaResponse[];
  errorMessage?: string;
  includeSelectedInactive?: boolean;
  isDisabled?: boolean;
  label?: string;
  name?: string;
  onBlur?: () => void;
  onChange: (value: string | null) => void;
  value?: string | null;
};

type CategorySelectOption = {
  category: CategoriaResponse;
  depth: number;
  path: string;
};

const categoryNameCollator = new Intl.Collator("pt-BR", { sensitivity: "base" });

function flattenCategoryOptions(
  nodes: readonly CategoryTreeNode<CategoriaResponse>[],
  ancestorNames: readonly string[] = [],
): CategorySelectOption[] {
  const sortedNodes = nodes.toSorted((left, right) =>
    categoryNameCollator.compare(left.nome, right.nome),
  );

  return sortedNodes.flatMap((node) => {
    const pathParts = [...ancestorNames, node.nome];
    const option: CategorySelectOption = {
      category: node,
      depth: ancestorNames.length,
      path: pathParts.join(" › "),
    };

    return [option].concat(flattenCategoryOptions(node.children, pathParts));
  });
}

export function CategorySelect({
  categories,
  errorMessage,
  includeSelectedInactive = false,
  isDisabled = false,
  label = "Categoria",
  name,
  onBlur,
  onChange,
  value,
}: CategorySelectProps) {
  const activeCategories = categories.filter(
    (category) => category.ativo || (includeSelectedInactive && category.id === value),
  );
  const categoryOptions = flattenCategoryOptions(buildCategoryTree(activeCategories));

  return (
    <Select
      className="min-w-0"
      errorMessage={errorMessage}
      isDisabled={isDisabled}
      label={label}
      name={name}
      onBlur={onBlur}
      onSearchClear={() => onChange(null)}
      onChange={(nextValue) =>
        onChange(
          nextValue === null || String(nextValue) === NO_CATEGORY_OPTION ? null : String(nextValue),
        )
      }
      value={value ?? NO_CATEGORY_OPTION}
      placeholder="Sem categoria"
      selectedText={(key) => {
        if (key === null || key === NO_CATEGORY_OPTION) {
          return "";
        }

        const selectedCategory = activeCategories.find((category) => category.id === key);

        if (!selectedCategory) {
          return "";
        }

        return `${selectedCategory.nome}${selectedCategory.ativo ? "" : " · inativa"}`;
      }}
    >
      <SelectItem id={NO_CATEGORY_OPTION} textValue="Sem categoria">
        Sem categoria
      </SelectItem>
      {categoryOptions.map(({ category, depth, path }) => {
        const textValue = `${path}${category.ativo ? "" : " (inativa)"}`;

        return (
          <SelectItem
            aria-label={textValue}
            id={category.id}
            key={category.id}
            textValue={textValue}
          >
            <span className="block min-w-0 truncate" title={textValue}>
              {`${"— ".repeat(depth)}${category.nome}`}
              {!category.ativo && " · inativa"}
            </span>
          </SelectItem>
        );
      })}
    </Select>
  );
}

type Choice<T extends string> = {
  label: string;
  value: T;
};

function getChoiceValue<T extends string>(choices: readonly Choice<T>[], value: string) {
  return choices.find((choice) => choice.value === value)?.value;
}

const transactionTypeChoices = [
  { label: "Despesa", value: "DESPESA" },
  { label: "Receita", value: "RECEITA" },
] satisfies readonly Choice<TransactionType>[];

const transactionSituationChoices = [
  { label: "Efetivada", value: "EFETIVADA" },
  { label: "Planejada", value: "PLANEJADA" },
] satisfies readonly Choice<TransactionSituation>[];

export function TransactionTypeField({
  focusOnOpen = false,
  isDisabled = false,
  onChange,
  value,
}: {
  focusOnOpen?: boolean;
  isDisabled?: boolean;
  onChange: (value: TransactionType) => void;
  value: TransactionType;
}) {
  return (
    <RadioGroup
      appearance="segmented"
      isDisabled={isDisabled}
      label="Tipo"
      name="tipo"
      onChange={(nextValue) => {
        const nextType = getChoiceValue(transactionTypeChoices, nextValue);

        if (nextType !== undefined) {
          onChange(nextType);
        }
      }}
      value={value}
    >
      {transactionTypeChoices.map((choice) => (
        <RadioItem
          focusOnOpen={focusOnOpen && choice.value === value}
          key={choice.value}
          value={choice.value}
        >
          {choice.label}
        </RadioItem>
      ))}
    </RadioGroup>
  );
}

export function TransactionSituationField({
  isDisabled = false,
  onChange,
  value,
}: {
  isDisabled?: boolean;
  onChange: (value: TransactionSituation) => void;
  value: TransactionSituation;
}) {
  return (
    <RadioGroup
      appearance="segmented"
      isDisabled={isDisabled}
      label="Situação"
      name="situacao"
      onChange={(nextValue) => {
        const nextSituation = getChoiceValue(transactionSituationChoices, nextValue);

        if (nextSituation !== undefined) {
          onChange(nextSituation);
        }
      }}
      value={value}
    >
      {transactionSituationChoices.map((choice) => (
        <RadioItem key={choice.value} value={choice.value}>
          {choice.label}
        </RadioItem>
      ))}
    </RadioGroup>
  );
}
