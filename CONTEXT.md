# Economize frontend

Vocabulário compartilhado para a integração do frontend com a API do Economize e para distinguir dados reais do backend de dados demonstrativos da interface.

## Integração com a API

**API do Economize**:
A API HTTP que fornece os dados persistidos e valida as operações financeiras do produto.
_Evitar_: backend, servidor, API externa

**Contrato da API**:
Conjunto acordado de requisições, respostas, status HTTP e problemas que define como o frontend conversa com a API do Economize.
_Evitar_: formato do endpoint, modelo HTTP

**Problema da API**:
Resposta estruturada que explica por que a API recusou ou não conseguiu concluir uma requisição, seguindo o formato Problem Details do produto.
_Evitar_: erro genérico, mensagem de erro

**Código do problema**:
Identificador estável extraído do final do campo `type` de um Problema da API, como `DADOS_INVALIDOS` ou `CREDENCIAIS_INVALIDAS`.
_Evitar_: código HTTP, status do erro

**Erro de campo**:
Detalhe de um Problema da API associado a um campo específico da requisição, com `field` e `detail`.
_Evitar_: erro de formulário, validação local

**Sessão**:
Estado de autenticação mantido pela API por meio dos cookies de autenticação e CSRF do usuário.
_Evitar_: token no frontend, estado logado

**Operação mutável**:
Requisição que cria, altera ou remove dados persistidos e, por isso, exige a proteção CSRF prevista pelo contrato da API.
_Evitar_: requisição de escrita, comando

**Estado de servidor**:
Dados persistidos pela API do Economize que o frontend mantém com ciclo próprio de cache, atualização e invalidação; filtros na URL e estado de modal não fazem parte dele.
_Evitar_: estado global, estado da tela

**Consulta do recurso**:
Definição tipada de como um recurso da API é identificado, carregado e mantido no cache do TanStack Query, incluindo todas as variáveis que alteram seu resultado.
_Evitar_: fetch da tela, cache sem chave

**Invalidação da consulta**:
Operação que marca consultas afetadas por uma operação mutável como obsoletas para que o TanStack Query atualize os dados ativos.
_Evitar_: recarregar a página, invalidar a rota inteira

## Transações e séries

**Transação simples**:
Receita ou despesa única, sem repetição.
_Evitar_: lançamento avulso, transação comum

**Transferência**:
Movimento de valor entre duas contas do usuário, com uma saída e uma entrada de mesma data, valor e situação; não tem categoria nem repetição.
_Evitar_: transação entre contas

**Série**:
Conjunto de ocorrências geradas por uma repetição a partir da data financeira da primeira ocorrência.
_Evitar_: recorrência (como nome da série), grupo, lançamento recorrente

**Ocorrência**:
Cada lançamento de uma série em uma data; é virtual enquanto apenas segue a regra e individualizada depois de alterada ou efetivada, continuando na série.
_Evitar_: instância, item da recorrência

**Ocorrência protegida**:
Ocorrência individualizada ou efetivada que alterações em lote não mudam.
_Evitar_: ocorrência travada, exceção

**Repetição**:
Configuração que define a cadência de uma série: frequência, intervalo, ancoragem e término.
_Evitar_: regra, RRULE, recorrência

**Ancoragem**:
Critério que posiciona cada ocorrência no mês: o mesmo dia do mês da primeira ocorrência ou o mesmo N-ésimo dia útil.
_Evitar_: política de data, dia fixo

**Dia útil**:
Dia de segunda a sexta-feira; feriados não são considerados.
_Evitar_: dia comercial

**Término**:
Forma como uma série acaba: nunca, em uma data, após um número de ocorrências ou ao fim das parcelas.
_Evitar_: fim da recorrência, limite

**Parcelamento**:
Série cujo término é por parcelas numeradas, com valor por parcela e total de parcelas definidos.
_Evitar_: compra parcelada, tipo de operação

**Parcela**:
Ocorrência numerada de um parcelamento, exibida como "parcela X de Y".
_Evitar_: prestação

**Escopo de edição**:
Alcance de uma alteração ou exclusão de ocorrência: "Somente esta" ou "Esta e as próximas".
_Evitar_: modo de edição, alcance

**Chave de edição**:
Identificador opaco que a API fornece para editar ou excluir uma transação simples ou ocorrência.
_Evitar_: ID da transação, ID da ocorrência

**Versão de edição**:
Marca opaca da versão lida de um lançamento; a API recusa a escrita quando o lançamento mudou desde a leitura.
_Evitar_: versão, timestamp, ETag

**Conflito de versão**:
Recusa de uma escrita porque o lançamento foi alterado depois de lido.
_Evitar_: erro de concorrência, edição duplicada

## Dados exibidos

**Dado demonstrativo**:
Valor mantido localmente apenas para compor uma tela ainda não conectada ao recurso correspondente da API.
_Evitar_: mock de produção, dado falso
