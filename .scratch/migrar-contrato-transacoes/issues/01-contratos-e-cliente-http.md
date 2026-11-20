# 01: Contratos e cliente HTTP

**O que construir:** Atualizar os schemas Zod e as funções de `src/services/` para o contrato unificado, remover `services/recurrences/` e ajustar o cliente HTTP (retry e mapeamento de erros).

**Bloqueada por:** nenhuma.

**Status:** done

**Referências na spec:** "Contrato no frontend (resumo)", "Identificação dos itens", "Erros e concorrência".

**Estado observado no código** (em 2026-11-15):

- `services/recurrences/api.ts` chama `POST /recorrencias` e `PUT/DELETE /recorrencias/{segmentoId}/ocorrencias/{data}`, rotas que não existem mais.
- `transacaoResponseSchema` exige `id`, mas `POST/PUT /transacoes` agora devolvem `ItemResponse`, sem `id`.
- `transferenciaResponseSchema` exige `id`, mas o campo virou `transferenciaId`.
- `putTransacao` e `deleteTransacao` validam o identificador com `z.uuid()`, mas `chaveEdicao` é opaca.
- `normalizeOptionalText` e `categoriaId ?? undefined` omitem campos que o contrato exige como `null` explícito.
- `lib/api.ts:130` retenta `put` e `delete`.

**Critérios de aceite:**

- [x] `services/recurrences/` foi removido e não há imports remanescentes.
- [x] `consultaTransacaoItemSchema` reflete `ItemResponse` e não usa mais `segmentoRecorrenciaId`, `grupoRecorrenciaId`, `dataOriginalRecorrencia`, `inicioRecorrencia`, `rrule` nem `politicaDataOcorrencia` na raiz.
- [x] Existem schemas para `RepeticaoTransacaoRequest`, `TerminoTransacaoRequest`, `RepeticaoResponse`, `SerieResponse` e `EscopoEdicaoTransacao`.
- [x] `postTransacao` e `putTransacao(chaveEdicao, body)` respondem com o schema de `ItemResponse`.
- [x] `deleteTransacao(chaveEdicao, { versaoEdicao, escopo? })` está implementada.
- [x] Transferências: o PUT envia `versaoEdicao`, o DELETE envia `?versaoEdicao=` e a resposta usa `transferenciaId`.
- [x] Os campos anuláveis obrigatórios (`categoriaId`, `observacoes`, `repeticao`) são enviados como `null`.
- [x] `chaveEdicao` é codificada como segmento de URL e não é validada como UUID.
- [x] O retry automático está desligado para `put` e `delete`.
- [x] O `ApiError` expõe os códigos `VERSAO_DESATUALIZADA`, `RECURSO_NAO_ENCONTRADO`, `OCORRENCIA_EFETIVADA_APOS_CORTE` e `SEGMENTO_NAO_ATUAL`, e há um helper com a mensagem orientativa de cada um.
- [x] `docs/agent-guidelines/frontend-architecture.md` registra a política de retry e o uso de Chave e Versão de edição.
- [x] `pnpm check` passa. Os componentes podem ficar provisoriamente compilando com o mínimo de adaptação; o comportamento completo vem nas issues 02 a 06.

**Como verificar:** `pnpm check`, e carregar `/transactions` contra o backend local sem erro de contrato.
