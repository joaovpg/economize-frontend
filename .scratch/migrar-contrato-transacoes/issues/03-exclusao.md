# 03: Exclusão com Chave e Versão de edição

**O que construir:** Refazer `TransactionDeleteModal` para excluir transação simples, ocorrência de série (com escopo) e transferência pelo contrato novo.

**Bloqueada por:** 01.

**Status:** done

**Referências na spec:** "Exclusão", "Identificação dos itens", "Erros e concorrência".

**Critérios de aceite:**

- [x] Transação simples é excluída por `chaveEdicao` + `versaoEdicao`, sem escopo.
- [x] Ocorrência de série: as opções de escopo vêm de `escoposDisponiveis`, com os rótulos "Somente esta" e "Esta e as próximas" (`SOMENTE_ESTA`/`ESTA_E_AS_PROXIMAS`).
- [x] "Esta e as próximas" mostra o aviso "Remove esta e as próximas; ocorrências já efetivadas são mantidas."
- [x] Transferência é excluída por `operacaoId` + `versaoEdicao`.
- [x] 409 e 404: o modal continua aberto, mostra a mensagem da spec e a listagem é invalidada.
- [x] Depois do sucesso, a listagem é invalidada.
- [x] `pnpm check` passa.

**Como verificar:** passos 7, 8 e 9 do roteiro da spec.
