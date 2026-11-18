# 08: Edição e ativação de conta

**O que construir:** Editar contas reaproveitando o `AccountEditorModal` e ativar ou inativar pela listagem, no mesmo padrão de categorias.

**Bloqueada por:** nenhuma.

**Status:** done

**Contrato:** `PUT /api/contas/{contaId}` recebe `nome`, `moeda`, `saldoInicial`, `dataSaldoInicial` e `ativo` (todos obrigatórios) e responde `ContaResponse`. `GET /api/contas?ativo=` filtra por estado.

**Critérios de aceite:**

- [x] `putConta` e o schema `EditarContaRequest` existem em `services/accounts/`.
- [x] O `AccountEditorModal` tem modo edição, com nome, moeda, saldo inicial e data preenchidos.
- [x] A listagem de contas tem um switch Ativa/Inativa com confirmação, como em categorias.
- [x] Depois do sucesso, as consultas de contas são invalidadas.
- [x] `pnpm check` passa.

**Como verificar:** editar o nome e o saldo inicial de uma conta, inativá-la e reativá-la.
