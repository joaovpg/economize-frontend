# Consulta de transações integrada ao backend

**Status:** Superseded by [ADR-0008](0008-integracao-do-tanstack-query-com-o-tanstack-router.md)

## Contexto

O frontend possuía dados demonstrativos para resumo e transações. O backend oferece a consulta `GET /api/transacoes`, autenticada pela sessão em cookie, com período obrigatório em `yyyy-MM`, filtros repetidos de conta e categoria, saldo de abertura e itens de origens diferentes. O contrato usa valores assinados e não expõe um campo `tipo`; transferências têm categoria nula no payload.

O resumo não possui uma rota equivalente no backend. Portanto, retirar os dados locais do resumo não deve ser compensado por uma nova chamada inventada ou por agregações calculadas a partir de um contrato que não existe.

## Decisão

- A consulta de transações será acessada por `src/services/transactions/api.ts`, usando o cliente Ky compartilhado de `src/lib/api.ts`.
- Os requests e responses serão validados na fronteira por schemas Zod em `src/services/transactions/contracts.ts`, com tipos inferidos desses schemas.
- A rota de transações carregará o mês, contas e categorias por `loaderDeps`; os filtros serão mantidos em search params validados pelo TanStack Router.
- O filtro será um componente controlado reutilizável entre resumo e transações. A busca textual (`q`) continuará local, porque não faz parte do contrato de `GET /api/transacoes`.
- O filtro de contas “Todas as contas” não será enviado ao backend. Contas e categorias selecionadas serão serializadas como parâmetros repetidos `contaId` e `categoriaId`.
- A tela de transações exibirá uma tabela mobile first com as colunas Descrição, Categoria, Conta e Valor. Em telas pequenas, cada linha se reorganiza como um bloco legível, sem depender de rolagem horizontal.
- `saldoAbertura` será exibido como saldo anterior em um bloco separado quando o filtro “Incluir saldo anterior” estiver ativo. Itens de origem `SALDO_INICIAL_CONTA` também serão preservados na tabela como informação de saldo inicial.
- A origem `TRANSFERENCIA` será apresentada como a categoria “Transferência”. As origens `TRANSACAO_RECORRENTE` e `PARCELA` serão sinalizadas com ícone de recorrência.
- O resumo permanecerá com estado vazio até existir um endpoint próprio. Não haverá dados demonstrativos, fallback fictício ou filtro de situação.
- Esta etapa cobre somente leitura. Criação, edição e remoção de transações ficam para contratos e fluxos futuros, incluindo a definição explícita de CSRF para operações mutáveis.
- A decisão original de não introduzir TanStack Query nesta etapa foi substituída pela ADR-0008. O contrato manual validado e o serviço de domínio continuam sendo usados, agora atrás de `queryOptions` e do cache compartilhado.

## Consequências

As telas passam a depender da sessão e dos recursos reais de contas e categorias. Respostas `401` continuam sob a política global do cliente HTTP; erros de contrato, período inválido e referências inexistentes sobem para os boundaries da rota. O frontend precisa traduzir apenas informações de apresentação, como a categoria visual de transferências e os nomes de recursos relacionados.

O resumo fica deliberadamente neutro até que o backend forneça uma consulta de resumo. Quando operações mutáveis forem implementadas, será necessário ampliar os contratos e revisar as políticas de retry e CSRF antes de expor ações financeiras na interface.
