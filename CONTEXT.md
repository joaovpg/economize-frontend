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

## Dados exibidos

**Dado demonstrativo**:
Valor mantido localmente apenas para compor uma tela ainda não conectada ao recurso correspondente da API.
_Evitar_: mock de produção, dado falso
