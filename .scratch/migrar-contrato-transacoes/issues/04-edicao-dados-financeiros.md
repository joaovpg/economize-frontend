# 04: Edição de dados financeiros

**O que construir:** Refazer o fluxo de `TransactionEditModal` para transação simples, transferência e ocorrência de série com os dois escopos. Nesta issue a regra de repetição não é alterada.

**Bloqueada por:** 01.

**Status:** done

**Referências na spec:** "Edição", "Erros e concorrência".

**Estado observado no código:**

- `TransactionEditModal.tsx:224-245` despacha para `putTransacao(operacaoId)`, `putTransferencia(operacaoId)` e `putOcorrenciaRecorrente(segmento, data)`.
- O escopo é um estado local com o padrão `ONLY_THIS`.

**Critérios de aceite:**

- [x] O tipo de operação fica fixo na edição.
- [x] Ocorrência de série: o seletor de escopo fica no topo, com as opções de `escoposDisponiveis`.
- [x] "Esta e as próximas" fica desabilitado quando o item está `EFETIVADA`.
- [x] "Somente esta" exibe o resumo da repetição em somente leitura (ex.: "Todo mês, dia 10 · parcela 3 de 12"; "Todo mês, no 5º dia útil") e reenvia a `repeticao` lida sem `numeroDiaUtil`.
- [x] "Esta e as próximas" mostra o aviso da spec e reenvia a `repeticao` lida, sem mudança de regra nesta issue.
- [x] Transação simples: PUT sem `escopo` e com `repeticao: null`.
- [x] Transferência: PUT com `versaoEdicao` e `observacoes` explícito.
- [x] 409, 404, `OCORRENCIA_EFETIVADA_APOS_CORTE` e `SEGMENTO_NAO_ATUAL` mostram as mensagens da spec com o modal aberto. 409 e 404 também invalidam a listagem.
- [x] `pnpm check` passa.

**Como verificar:** passos 3, 4 (só valor), 6, 8 e 9 do roteiro da spec.
