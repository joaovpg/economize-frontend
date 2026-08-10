# ADR-0001: Rotas Privadas Por Padrão

## Status

Aceito

## Contexto

O frontend possui apenas as telas públicas de login e cadastro, mas terá recursos financeiros que exigem autenticação. A sessão real ainda será integrada posteriormente.

## Decisão

As rotas serão privadas por padrão. Rotas públicas serão declaradas explicitamente fora do `RequireAuth`. O roteamento continuará usando a API declarativa do React Router, pois ela é suficiente para a composição atual de rotas e para o guard baseado em `Outlet`.

`RequireAuth` modela os estados `loading`, `unauthenticated` e `authenticated`. Pessoas não autenticadas são redirecionadas para `/login`, com a URL original preservada para uma futura conclusão do login.

## Consequências

- Uma nova rota não se torna pública por acidente.
- `/login` e `/cadastro` precisam ser declaradas fora do grupo privado.
- A integração de sessão deverá substituir o estado padrão não autenticado do `AuthProvider`.
- Rotas desconhecidas dentro da área privada exibem 404 quando a pessoa está autenticada.
