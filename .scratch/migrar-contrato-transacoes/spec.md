# Migrar o frontend para o contrato unificado de transações

Status: ready-for-agent

## Objetivo e contexto

A API do Economize unificou a escrita de receitas, despesas, séries e parcelamentos em `/api/transacoes`. Também passou a exigir Chave de edição e Versão de edição para alterar ou excluir lançamentos. As rotas `/api/recorrencias` deixaram de existir. O deploy do backend que remove essas rotas aplica as migrations V8 a V11 e exige que o frontend de produção seja atualizado junto.

Esta spec descreve a adaptação do frontend a esse contrato e três ajustes pequenos que aproveitam a mesma entrega: logout, edição de conta e o limite do nome de categoria.

Fontes do contrato:

- OpenAPI em `http://localhost:8080/q/openapi`.
- Backend em `C:\Projetos\Projetos\Backend\economize`:
  - `.scratch/contratos-transacoes-unificados/spec.md`;
  - `.scratch/simplificar-repeticao/spec.md`, que prevalece sobre a anterior nos pontos que altera;
  - `CONTEXT.md`.
- No backend, a prévia de edição e as resoluções de sobreposição foram removidas e substituídas pela regra "Realizado posterior ao corte". Nada desta spec usa `previa-edicao`, `politicaSobreposicao` ou `resolucoesSobreposicao`.

O vocabulário está na seção "Transações e séries" de `CONTEXT.md`.

## User stories

1. Como Usuário, quero registrar uma receita ou despesa e, opcionalmente, repeti-la a cada X dias, semanas, meses ou anos.
2. Como Usuário, quero que uma repetição mensal caia no mesmo dia do mês ou no N-ésimo dia útil, como um salário no 5º dia útil.
3. Como Usuário, quero escolher se a série nunca termina, termina numa data, após N ocorrências ou ao fim de um parcelamento que começa na parcela X de Y.
4. Como Usuário, quero editar ou excluir somente uma ocorrência, ou esta e as próximas.
5. Como Usuário, quero mudar a regra de uma série a partir de uma ocorrência, transformar uma transação simples em série e encerrar uma série transformando a ocorrência em transação simples.
6. Como Usuário, quero ser avisado quando o lançamento mudou desde que o abri, para não sobrescrever dados.
7. Como Usuário, quero ver as parcelas numeradas e identificar lançamentos repetidos na listagem.
8. Como Usuário, quero sair da minha sessão.
9. Como Usuário, quero editar e ativar ou inativar minhas contas.

## Decisões

### Entrega

- Nove issues em fatias verticais (ver `issues/`). As issues 01 a 06 formam a migração e entram juntas no deploy coordenado com o backend. As issues 07 a 09 são independentes.
- Não há worktrees nem PRs separados por issue.

### Modelo de operação na interface

- O modal de criação oferece apenas **Transação** e **Transferência**. As opções Recorrência e Parcelamento deixam de existir.
- Transação tem a seção opcional **Repetir**:
  - switch desligado por padrão (desligado envia `repeticao: null`, ou seja, Transação simples);
  - ligado, mostra:
    - **A cada [intervalo] [dias | semanas | meses | anos]**: `DIARIA`, `SEMANAL`, `MENSAL`, `ANUAL`;
    - **Ancoragem**, somente com meses: "No dia D" (`DIA_DO_MES`) ou "No Nº dia útil" (`DIA_UTIL`);
    - **Termina**: Nunca (`INDEFINIDO`), Em uma data (`EM_DATA`), Após N ocorrências (`APOS_OCORRENCIAS`), Em parcelas (`PARCELAS`);
  - "Em parcelas" mostra **Parcela inicial** (padrão 1) e **Total de parcelas**. O rótulo do valor muda para **Valor de cada parcela**;
  - padrões ao ligar: mensal, a cada 1, mesmo dia do mês, termina nunca.
- A opção de dia útil só aparece com frequência mensal e Data financeira de segunda a sexta com N ≤ 20. O front calcula N só para o rótulo: N é a posição da data entre os dias de segunda a sexta do mês, sem feriados. N nunca é enviado. Na leitura, o rótulo usa `repeticao.numeroDiaUtil`.
- Com Repetir ligado, o campo Situação mostra a dica "Vale só para a primeira ocorrência".

### Edição

- O tipo de operação (Transação ou Transferência) fica fixo na edição.
- **Transação simples**: sem escopo. A seção Repetir aparece desligada. Ligá-la converte a transação na primeira ocorrência de uma série (PUT com `repeticao` preenchida).
- **Ocorrência de série**: o seletor de escopo fica **no topo** do modal, com as opções vindas de `escoposDisponiveis`.
  - **Somente esta**: a seção Repetir aparece como resumo somente leitura (ex.: "Todo mês, dia 10 · parcela 3 de 12"). O PUT reenvia a `repeticao` exatamente como foi lida, sem `numeroDiaUtil`.
  - **Esta e as próximas**: a seção Repetir fica editável. Mostra o aviso "Altera esta ocorrência e as seguintes; a data desta ocorrência passa a ser o início da nova regra."
  - Ao voltar de "Esta e as próximas" para "Somente esta", as mudanças na repetição são descartadas e ela volta ao valor lido.
  - Com "Esta e as próximas", desligar Repetir transforma a ocorrência em transação simples (`repeticao: null`). Mostra o aviso inline "Esta ocorrência vira uma transação simples e as próximas deixam de existir. Ocorrências já efetivadas são mantidas.", sem modal de confirmação.
  - "Esta e as próximas" fica desabilitado quando a própria ocorrência está `EFETIVADA`, porque o backend sempre recusa esse caso.
- **Transferência**: sem escopo e sem repetição. Envia `versaoEdicao`.

### Exclusão

- Transação simples: `DELETE /transacoes/{chaveEdicao}?versaoEdicao=…`, sem escopo.
- Ocorrência de série: o escopo é escolhido entre `escoposDisponiveis`. Com "Esta e as próximas", mostra o aviso "Remove esta e as próximas; ocorrências já efetivadas são mantidas."
- Transferência: `DELETE /transferencias/{operacaoId}?versaoEdicao=…`.
- Saldo inicial não é editável nem excluível.

### Identificação dos itens

| Origem                                                 | Editar e excluir por               | Versão         |
| ------------------------------------------------------ | ---------------------------------- | -------------- |
| `TRANSACAO_SIMPLES`, `TRANSACAO_RECORRENTE`, `PARCELA` | `chaveEdicao`                      | `versaoEdicao` |
| `TRANSFERENCIA`                                        | `operacaoId` (ID da transferência) | `versaoEdicao` |
| `SALDO_INICIAL_CONTA`                                  | não editável                       | —              |

`chaveEdicao` é opaca e não é UUID. O cliente não valida o formato da chave, só a codifica como segmento de URL.

### Erros e concorrência

- `409 VERSAO_DESATUALIZADA` e `404 RECURSO_NAO_ENCONTRADO` em edição ou exclusão:
  - o modal continua aberto e mostra a mensagem;
  - a listagem é invalidada;
  - nada é reenviado automaticamente;
  - mensagens: 409 "Este lançamento foi alterado em outro lugar. Feche e abra novamente para ver a versão atual."; 404 "Este lançamento não existe mais ou foi alterado. Feche e consulte novamente."
- `422 OCORRENCIA_EFETIVADA_APOS_CORTE`: "Há lançamentos efetivados a partir desta data. Edite somente esta ocorrência ou a partir da próxima não efetivada."
- `422 SEGMENTO_NAO_ATUAL`: "Esta série já foi alterada a partir de uma data posterior. Edite a partir de uma ocorrência mais recente."
- `422 REPETICAO_INVALIDA`, `422 PARCELAMENTO_INVALIDO`, `422 ESCOPO_INVALIDO` e os Erros de campo seguem o mapeamento existente para mensagem geral ou de campo (`form-errors.ts`).
- O retry automático de PUT e DELETE é desligado no cliente HTTP. Com Versão de edição, repetir a requisição só produziria Conflito de versão.
- Depois de cada escrita, a listagem é invalidada. O corpo da resposta passa pela validação de schema, mas não alimenta o cache.

### Validação no cliente

Regras replicadas no formulário para dar resposta imediata. O servidor continua sendo a autoridade.

- intervalo inteiro ≥ 1;
- `EM_DATA`: data não anterior à Data financeira;
- `APOS_OCORRENCIAS`: quantidade inteira ≥ 1;
- `PARCELAS`: 1 ≤ parcela inicial ≤ total;
- `DIA_UTIL`: somente mensal, Data financeira de segunda a sexta e N ≤ 20;
- regras atuais de situação: efetivada não pode ter data futura no fuso do usuário.

### Listagem

- A key de cada linha é `chaveItem`.
- A descrição de parcelas mostra "(X/Y)" a partir de `serie.numeroParcela` e `serie.totalParcelas`.
- Ocorrências de série (`TRANSACAO_RECORRENTE`, `PARCELA`) têm um ícone discreto de repetição.
- Não há distinção visual entre ocorrência virtual e individualizada.
- `situacao: null` é exibida como Planejada. No backend, só o saldo inicial vem nulo; ocorrências virtuais vêm `PLANEJADA`.

### Contrato no frontend (resumo)

- `services/recurrences/` é removido.
- `CriarTransacaoRequest`: `contaId`, `categoriaId` (anulável), `situacao`, `tipo`, `descricao`, `observacoes` (anulável), `valor`, `dataFinanceira`, `repeticao` (anulável). Os campos anuláveis são enviados como `null` explícito, nunca omitidos.
- `AlterarTransacaoRequest`: os campos de criação mais `versaoEdicao` e `escopo` (`SOMENTE_ESTA` | `ESTA_E_AS_PROXIMAS`). `escopo` só é enviado para ocorrência de série.
- `RepeticaoTransacaoRequest`: `frequencia`, `intervalo`, `ancoragem`, `termino { tipo, data?, quantidade?, numeroPrimeiraParcela?, totalParcelas? }`. Cada tipo de término envia somente os próprios campos, e campos desconhecidos são rejeitados.
- `ItemResponse`:
  - campos principais: `origem`, `operacaoId?`, `situacao?`, `descricao`, `observacoes?`, `valor` (com sinal), `dataFinanceira`, `efetivadoEm?`, `contaId`, `categoriaId?`, `contaContraparteId?`;
  - identificação e edição: `chaveItem`, `chaveEdicao?`, `versaoEdicao?`, `tipo?`, `virtual?`, `protegida?`, `escoposDisponiveis`;
  - série: `serie? { grupoId, segmentoId, inicioSegmento, dataOriginal, numeroParcela?, totalParcelas? }`;
  - repetição: `repeticao? { frequencia, intervalo, ancoragem, numeroDiaUtil?, termino }`.
- `POST` e `PUT /transacoes` respondem `ItemResponse`.
- Transferência: os writes enviam `observacoes` explicitamente (anulável). O PUT envia `versaoEdicao`. `TransferenciaResponse` tem `transferenciaId` (antes `id`) e `versaoEdicao`.
- Categoria: `nome` com no máximo 80 caracteres.

## Pendências no backend

Não bloqueiam o frontend, que tem tratamento de meio-tempo para cada uma.

1. `escoposDisponiveis` sempre devolve os dois escopos para série. Deveria omitir `ESTA_E_AS_PROXIMAS` quando a regra "Realizado posterior ao corte" vai recusar a edição.
2. A descrição de `ItemResponse.situacao` na OpenAPI diz "nula para … ocorrência virtual". O código devolve `PLANEJADA`.
3. `AlterarTransacaoRequest.escopo` aparece como `JsonNode` (`type: array`) na OpenAPI. Deveria referenciar `EscopoEdicaoTransacao`.
4. A OpenAPI ainda publica schemas antigos (`FrequenciaRecorrencia`, `StatusRecorrencia`, `TipoGrupoRecorrencia`, `PoliticaDataOcorrencia`) e duplica `Frequencia`/`FrequenciaRepeticao`.

## Fora de escopo

- Ação rápida "Efetivar" na tabela.
- Menu ou navegação da área privada além do botão Sair.
- Prévia de edição e resolução de sobreposições, removidas do backend.
- Feriados no dia útil, "último dia útil" e repetições com vários dias.
- Introdução de testes automatizados.

## Verificação

Critério de cada issue: `pnpm check` verde e o roteiro manual da issue executado contra o backend local.

Roteiro geral da migração (issues 01 a 06):

1. Criar transação simples, recorrente mensal indefinida, recorrente no 5º dia útil, com término em data, após N ocorrências e parcelada (3 de 10).
2. Na listagem: conferir "(3/10)", o ícone de repetição, keys estáveis e o saldo.
3. Editar uma ocorrência com "Somente esta" (valor e efetivação) e verificar que ela continua na série.
4. Editar com "Esta e as próximas": mudar valor, mudar frequência, trocar recorrência ↔ parcelamento e desligar Repetir.
5. Converter uma transação simples em série.
6. Tentar "Esta e as próximas" com uma ocorrência efetivada posterior e verificar a mensagem do 422.
7. Excluir com cada escopo e excluir uma transação simples.
8. Criar, editar e excluir uma transferência.
9. Abrir o mesmo lançamento em duas abas, salvar em uma e salvar na outra: a segunda mostra a mensagem do 409.

## Documentação a atualizar

- `CONTEXT.md`: seção "Transações e séries" (já registrada).
- `docs/agent-guidelines/frontend-architecture.md`: registrar que PUT e DELETE não são retentados e que edições usam Chave e Versão de edição.
