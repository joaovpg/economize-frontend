# 05: Seção Repetir na criação

**O que construir:** Substituir as opções Recorrência e Parcelamento do modal de criação pela seção Repetir dentro de Transação, gerando `repeticao` no formato novo.

**Bloqueada por:** 01.

**Status:** done

**Referências na spec:** "Modelo de operação na interface", "Validação no cliente".

**Estado observado no código:**

- `transaction-form.ts` tem `formularioTipoOperacaoSchema` com quatro valores, as validações `validateWeeklyDays` e `validateMonthlyDays`, e as funções `toCreateRecurrenceRequest` e `toCreateInstallmentRequest`.
- `RecurrenceFields.tsx` tem seleção de vários dias da semana e do mês, `semTermino`, `ate` e `quantidadeOcorrencias`.
- `TransactionCreationModal.tsx` chama `postRecorrencia`.

**Critérios de aceite:**

- [x] O seletor de operação tem só Transação e Transferência.
- [x] O switch Repetir vem desligado por padrão. Ao ligar, os padrões são: mensal, a cada 1, mesmo dia do mês, termina nunca.
- [x] Frequência: dias, semanas, meses e anos (`DIARIA`/`SEMANAL`/`MENSAL`/`ANUAL`), com intervalo.
- [x] A ancoragem aparece só com meses. A opção "No Nº dia útil" aparece só com data de segunda a sexta e N ≤ 20, com N calculado no front apenas para o rótulo.
- [x] Término: Nunca, Em uma data, Após N ocorrências ou Em parcelas. Cada tipo envia só os próprios campos.
- [x] "Em parcelas" mostra Parcela inicial (padrão 1) e Total de parcelas, e o rótulo do valor muda para "Valor de cada parcela".
- [x] Com Repetir ligado, Situação mostra a dica "Vale só para a primeira ocorrência".
- [x] As validações do cliente da spec estão implementadas. Não sobra validação de dias da semana ou do mês.
- [x] O componente de repetição pode ser reaproveitado na edição (issue 06).
- [x] `pnpm check` passa.

**Como verificar:** passos 1 e 2 do roteiro da spec.
