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

## Dados exibidos

**Dado demonstrativo**:
Valor mantido localmente apenas para compor uma tela ainda não conectada ao recurso correspondente da API.
_Evitar_: mock de produção, dado falso
