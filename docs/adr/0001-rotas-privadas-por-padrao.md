# ADR-0001: Rotas Privadas Por Padrão

## Status

Aceito

## Contexto

O frontend possui as telas públicas de login e cadastro e terá recursos financeiros que exigem
autenticação. A sessão é gerenciada pelo backend; o frontend não mantém um guard independente para
validá-la.

## Decisão

As rotas serão privadas por padrão. Rotas públicas serão declaradas explicitamente sob
`PublicLayout`, enquanto as demais ficarão sob `PrivateLayout`. O roteamento continuará usando a
API declarativa do React Router, pois ela é suficiente para a composição atual de grupos de rotas.

`PublicLayout` agrupa as rotas públicas e `PrivateLayout` agrupa as rotas privadas. `PrivateLayout`
é um shell de composição e não autentica a pessoa. A API é a fonte de verdade da sessão: quando uma
requisição feita fora das rotas públicas retorna `401`, o frontend redireciona a pessoa para
`/login`.

O resumo financeiro será exposto no código como `SummaryPage`, na rota `/summary`. A rota legada
`/dashboard` redirecionará para `/summary` durante a transição.

## Consequências

- Uma nova rota não se torna pública por acidente.
- `/login` e `/cadastro` precisam ser declaradas fora do grupo privado.
- A sessão não precisa ser duplicada em um estado de autenticação no frontend.
- Rotas desconhecidas dentro da área privada exibem 404 até que uma requisição da API indique que a
  sessão não é válida.
