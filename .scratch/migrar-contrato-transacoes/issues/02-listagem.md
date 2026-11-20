# 02: Listagem com séries e parcelas

**O que construir:** Ajustar `TransactionTable` e `TransactionsView` ao novo `ItemResponse`.

**Bloqueada por:** 01.

**Status:** done

**Referências na spec:** "Listagem".

**Estado observado no código:**

- `TransactionTable.tsx:112` monta a key com `operacaoId ?? segmentoRecorrenciaId ?? grupoRecorrenciaId`.
- `TransactionTable.tsx:87` lê `numeroParcela` e `totalParcelas` da raiz do item.

**Critérios de aceite:**

- [x] A key de cada linha é `item.chaveItem`.
- [x] A descrição de parcelas mostra "(X/Y)" a partir de `item.serie`.
- [x] Ocorrências `TRANSACAO_RECORRENTE` e `PARCELA` exibem um ícone discreto de repetição, com rótulo acessível.
- [x] `situacao: null` é exibida como Planejada.
- [x] Não há distinção visual entre ocorrência virtual e individualizada.
- [x] `pnpm check` passa.

**Como verificar:** passo 2 do roteiro da spec.
