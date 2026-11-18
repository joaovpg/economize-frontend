# 06: Repetir na edição (alterar regra e converter)

**O que construir:** Reaproveitar a seção Repetir no modal de edição para alterar a regra com "Esta e as próximas", converter transação simples em série e converter série em transação simples.

**Bloqueada por:** 04, 05.

**Status:** done

**Referências na spec:** "Edição".

**Critérios de aceite:**

- [x] Transação simples: a seção Repetir aparece desligada. Ligá-la envia `repeticao` preenchida (conversão em série), sem `escopo`.
- [x] Ocorrência com "Esta e as próximas": a seção Repetir fica editável a partir da `repeticao` lida (sem `numeroDiaUtil`). É possível mudar frequência, intervalo, ancoragem e término, inclusive trocar entre recorrência e parcelamento.
- [x] Desligar Repetir em "Esta e as próximas" envia `repeticao: null` e mostra o aviso inline da spec, sem modal de confirmação.
- [x] Voltar para "Somente esta" descarta as mudanças na repetição e a restaura para o valor lido.
- [x] As validações do cliente da issue 05 valem na edição, tomando a Data financeira da ocorrência como início.
- [x] `pnpm check` passa.

**Como verificar:** passos 4 e 5 do roteiro da spec.
