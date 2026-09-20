import { type ContaResponse } from "../../../../services/accounts/contracts";
import { type CategoriaResponse } from "../../../../services/categories/contracts";
import { type ConsultaTransacaoItem } from "../../../../services/transactions/contracts";

export function getCategoryLabel(
  item: ConsultaTransacaoItem,
  categories: readonly CategoriaResponse[],
) {
  if (item.origem === "TRANSFERENCIA") {
    return "Transferência";
  }

  if (item.origem === "SALDO_INICIAL_CONTA") {
    return "Saldo inicial";
  }

  if (item.categoriaId === null) {
    return "Sem categoria";
  }

  return categories.find((category) => category.id === item.categoriaId)?.nome ?? "Sem categoria";
}

export function getAccountLabel(item: ConsultaTransacaoItem, accounts: readonly ContaResponse[]) {
  return accounts.find((account) => account.id === item.contaId)?.nome ?? "Conta indisponível";
}
