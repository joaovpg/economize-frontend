# Integração de backend em React + TypeScript

**Data da pesquisa:** 2026-09-11  
**Escopo:** Vite, React 19, TypeScript, TanStack Router, Ky, Zod e a organização atual de `src/services`.  
**Objetivo:** registrar recomendações aplicáveis ao Economize sem implementar a refatoração.

## Resumo executivo

O repositório já tem a decisão correta para a infraestrutura HTTP: um cliente Ky compartilhado em [`src/lib/api.ts`](../../src/lib/api.ts), com `VITE_API_URL`, cookies incluídos e tratamento transversal de `401`. A próxima fronteira deve ser fazer cada módulo em [`src/services/`](../../src/services/) representar um domínio, deixando rotas e componentes consumirem funções de serviço em vez de conhecerem URLs, opções do Ky ou formatos crus de resposta. Essa separação mantém o acesso a dados fora da renderização, alinhada à orientação do React para evitar usar Effects como orquestradores do fluxo de dados e às APIs de carregamento do TanStack Router ([React — You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect), [TanStack Router — Data Loading](https://tanstack.com/router/latest/docs/guide/data-loading)).

Recomendação para este projeto:

1. preservar um único cliente Ky em `src/lib/api.ts` para transporte, base URL, cookies, timeout, retry e políticas transversais;
2. mover chamadas de domínio para `src/services/<domínio>/api.ts`, com schemas e tipos em `contracts.ts` próximos da fronteira da API;
3. validar respostas externas em runtime com Zod antes de expô-las ao restante da aplicação;
4. manter loaders do TanStack Router para dados necessários à entrada de uma rota, usando `loaderDeps` para dependências derivadas de search params;
5. adotar TanStack Query quando o estado de servidor passar a ser compartilhado entre rotas/componentes, exigir deduplicação, invalidação ou mutations coordenadas;
6. usar um contrato OpenAPI gerado somente quando o backend fornecer uma especificação estável. Nesse caso, preferir geração de tipos com `openapi-typescript` e avaliar Orval apenas se hooks/clientes gerados trouxerem benefício maior que a manutenção de um segundo padrão de acesso.

## Leitura do repositório

- O cliente HTTP compartilhado está em [`src/lib/api.ts`](../../src/lib/api.ts). Ele usa `ky.create`, `prefix` baseado em `VITE_API_URL`, `credentials: "include"` e redireciona respostas `401` para `/login` fora das rotas públicas.
- [`src/services/accounts/`](../../src/services/accounts/), [`src/services/auth/`](../../src/services/auth/) e [`src/services/categories/`](../../src/services/categories/) reservam a divisão por domínio; cada pasta separa operações em `api.ts` dos schemas e tipos em `contracts.ts`.
- O resumo faz chamadas diretamente em [`src/lib/summary.ts`](../../src/lib/summary.ts), e o login chama o cliente diretamente em [`src/routes/_public/login.tsx`](../../src/routes/_public/login.tsx). Isso é um bom ponto de partida para uma migração posterior, mas hoje mistura caso de uso de domínio com detalhes HTTP.
- As diretrizes do projeto já recomendam [`src/lib/api.ts`](../../docs/agent-guidelines/frontend-architecture.md) para integrações HTTP, loaders para obter dados necessários à rota e estado compartilhado/restaurável na URL.
- O projeto atualmente não declara `@tanstack/react-query` em [`package.json`](../../package.json). Portanto, as recomendações de Query abaixo são uma decisão futura, não uma dependência que deva ser adicionada como parte deste relatório.

## Recomendações

### 1. Centralizar o cliente HTTP, mas limitar sua responsabilidade

O cliente Ky deve ser o único ponto de configuração de transporte. `ky.create` permite criar uma instância compartilhada e os hooks permitem aplicar comportamento transversal no ciclo da requisição ([Ky — `create`, hooks e opções](https://github.com/sindresorhus/ky/blob/main/readme.md)). Para o Economize, esse núcleo deve concentrar:

- `prefixUrl`/base URL e configuração de credenciais;
- headers comuns, `AbortSignal`, timeout e observabilidade;
- política de retry compatível com a semântica HTTP;
- conversão ou enriquecimento de erros de transporte;
- o redirecionamento de sessão expirada, que já é uma política do projeto.

Ele não deve conhecer contas, categorias, transações ou regras de negócio. Também não deve ser um lugar para esconder respostas como `unknown` convertidas por assertions. O cliente deve devolver a resposta para uma função de serviço que conhece o contrato do endpoint.

Uma organização-alvo, sem implicar criação imediata de todos os arquivos, seria:

```text
src/
  lib/
    api.ts              # Ky compartilhado e políticas transversais
    api-errors.ts       # erro normalizado da fronteira HTTP
  services/
    auth/
      api.ts            # operações de login, cadastro e sessão
      contracts.ts      # schemas e tipos de autenticação
    accounts/
      api.ts            # operações de contas
      contracts.ts      # schemas e tipos de contas
    categories/
      api.ts            # operações de categorias
      contracts.ts      # schemas e tipos de categorias
    transactions/       # recurso futuro
    summary/            # recurso futuro, se for agregado pela API
  routes/               # loaders/query options consomem services
```

Essa divisão é coerente com o Router: o `loader` recebe `params`, `deps`, `signal` e contexto e pode carregar dados antes da tela, sem acoplar a tela ao transporte ([TanStack Router — Data Loading](https://tanstack.com/router/latest/docs/guide/data-loading)). O `signal` recebido deve ser encaminhado ao Ky para cancelar requisições que ficaram obsoletas quando a navegação mudou.

### 2. Separar por domínio/serviço, não por verbo HTTP

Um serviço deve expor operações que expressem o caso de uso e esconder URL, serialização e detalhes do Ky. Por exemplo, uma futura função `listActiveCategories()` é uma fronteira mais útil para o restante da aplicação que espalhar `api.get("categorias", { searchParams: ... })` em rotas e componentes.

As funções de serviço devem:

- receber parâmetros de domínio já tipados;
- construir path, query string e body em um único lugar;
- validar a resposta antes de retorná-la;
- lançar um erro normalizado ou retornar uma união discriminada, de forma consistente;
- aceitar `signal` quando a operação puder ser cancelada pelo Router ou por uma biblioteca de cache;
- não atualizar estado React, navegar ou disparar toasts.

Rotas e componentes ficam responsáveis por composição de tela, estados visuais e interação. React recomenda que ações causadas por interação sejam tratadas no event handler e que buscas não sejam duplicadas em Effects sem necessidade; também alerta para race conditions, waterfalls e ausência de cache quando o fetching é implementado manualmente em Effects ([React — Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects), [React — You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)).

### 3. Tipagem end-to-end: contrato único, sem `json<unknown>` como destino final

TypeScript protege o código em compilação, mas não verifica o JSON recebido em runtime. A tipagem deve acompanhar o dado desde o contrato do endpoint até o componente:

```text
contrato OpenAPI ou schema manual
        ↓
tipo de request/response
        ↓
função de serviço
        ↓
loader ou query
        ↓
componente tipado
```

Há duas estratégias compatíveis:

1. **Contrato OpenAPI existente:** gerar tipos com [`openapi-typescript`](https://openapi-ts.dev/introduction) e usá-los nos serviços. A documentação oficial mostra que a geração elimina tipos manuais repetidos, mas também recomenda executar o compilador TypeScript para detectar incompatibilidades ([openapi-typescript — README](https://github.com/openapi-ts/openapi-typescript)).
2. **Contrato ainda inexistente ou instável:** definir tipos e schemas por domínio no próprio frontend, mantendo o formato explícito até o backend disponibilizar uma especificação confiável.

Orval é relevante se a equipe quiser gerar funções e hooks TanStack Query a partir de OpenAPI; a documentação oficial descreve a opção `client: 'react-query'` e a geração de hooks por endpoint ([Orval — React Query](https://orval.dev/docs/guides/react-query/)). A escolha tem um trade-off importante para este repositório: os exemplos gerados por Orval usam um cliente configurável próprio, enquanto o projeto já padroniza Ky. Se Orval for adotado, deve ser configurado para usar o mesmo transporte/políticas ou ficar atrás dos serviços; não se deve criar um caminho paralelo que ignore cookies, `401`, timeout, retry e normalização de erros de `src/lib/api.ts`.

O pacote `openapi-fetch`, embora apareça nos materiais do ecossistema `openapi-typescript`, entrou em modo de manutenção segundo o roadmap oficial de 2026 ([roadmap oficial do openapi-typescript](https://github.com/openapi-ts/openapi-typescript/discussions/2559)). Por isso, ele não é a recomendação padrão deste relatório para substituir o Ky.

### 4. Validar em runtime na fronteira da API

Todo dado que chega da rede deve ser tratado como entrada não confiável, mesmo quando seu tipo foi gerado. Zod permite declarar schemas, inferir tipos TypeScript e validar dados em runtime; `.parse` lança `ZodError`, enquanto `.safeParse` devolve um resultado discriminado sem exigir `try/catch` ([Zod — Basic usage](https://zod.dev/basics), [Zod — página inicial](https://zod.dev/)).

Aplicação recomendada:

- schema de request para garantir que o serviço nunca envie uma forma inválida;
- schema de response imediatamente após `response.json()`;
- `z.infer<typeof schema>` como tipo derivado, evitando duplicar interface e validação;
- `parse` quando uma resposta incompatível deve falhar rapidamente e subir para o boundary da rota;
- `safeParse` quando o serviço precisa transformar a falha em um erro de domínio observável e tratável;
- schemas de search params nas rotas, como o projeto já faz. O TanStack Router considera search params uma fronteira de entrada e documenta `validateSearch` com Zod para validar e tipar esses valores ([TanStack Router — Search Params](https://tanstack.com/router/latest/docs/guide/search-params)).

A validação deve ocorrer no serviço, não apenas no formulário. O formulário protege a entrada do usuário; o serviço protege a aplicação contra backend desatualizado, proxy mal configurado, payload parcial, regressão de contrato ou resposta inesperada.

### 5. Modelar erros por camada

O consumidor não deve precisar adivinhar se um erro é uma resposta HTTP, uma falha de rede, timeout, payload incompatível ou regra de negócio. Ky oferece tipos e guards para `HTTPError`, `NetworkError`, `TimeoutError` e outros erros do ciclo HTTP; `HTTPError` carrega a `Response` e pode carregar o corpo pré-interpretado em `data` ([Ky — errors](https://github.com/sindresorhus/ky/blob/main/readme.md)).

Uma taxonomia mínima para os serviços:

| Classe         | Exemplo                                                    | Comportamento esperado                                                       |
| -------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Transporte     | offline, DNS, CORS, timeout                                | informar indisponibilidade/reconexão; não fingir que é erro de validação     |
| HTTP/protocolo | `401`, `403`, `404`, `409`, `429`, `5xx`                   | usar status e política de produto; preservar contexto para observabilidade   |
| Domínio        | saldo insuficiente, conflito de edição, regra de categoria | exibir mensagem acionável ou erro de campo conforme o contrato               |
| Contrato       | resposta não conforma o schema Zod                         | tratar como incompatibilidade de integração; registrar o payload com cuidado |

Para o formato de erro do backend, a recomendação é adotar [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html), cujo objetivo é transportar detalhes legíveis por máquina em respostas HTTP. O objeto pode usar `type`, `title`, `status`, `detail` e `instance`, além de extensões documentadas. O cliente deve preservar o `status` HTTP como fonte da semântica geral e usar `detail`/extensões para a mensagem específica; não deve depender de texto livre para decidir a lógica.

Uma futura normalização em `src/lib/api-errors.ts` pode converter os casos de Ky e Problem Details para um erro de aplicação com campos como `kind`, `status`, `code`, `message`, `fieldErrors` e `cause`. O redirecionamento global de `401` deve continuar separado da apresentação de mensagens e não deve engolir o erro da operação.

### 6. Respeitar semântica HTTP ao configurar retry

Retry automático não é uma política neutra. A RFC 9110 define `GET`, `HEAD`, `OPTIONS` e `TRACE` como métodos seguros; `PUT`, `DELETE` e métodos seguros são idempotentes. A mesma RFC recomenda que um cliente não repita automaticamente um método não idempotente, como `POST`, sem uma garantia adicional de idempotência ([RFC 9110 — métodos seguros e idempotentes](https://www.rfc-editor.org/rfc/rfc9110.html#section-9.2)).

O Ky já documenta retry por método/status, `Retry-After`, backoff e jitter ([Ky — retry](https://github.com/sindresorhus/ky/blob/main/readme.md)). Para o Economize:

- manter retry conservador para leitura e operações idempotentes;
- não aplicar retry cego a criação, pagamento, transferência ou qualquer `POST` com efeito financeiro;
- se o backend permitir repetição segura de um comando, exigir chave de idempotência ou outra forma verificável de detectar que a operação original não foi aplicada;
- respeitar `Retry-After` em `429`/`503` e limitar backoff;
- manter timeout explícito e abortável;
- documentar quando uma operação opta por `retry: { limit: 0 }`.

A RFC também define as classes de status (`2xx` sucesso, `4xx` erro do cliente, `5xx` erro do servidor) e os significados de `201 Created`, `202 Accepted` e `204 No Content`; os serviços devem interpretar o contrato do endpoint em vez de assumir que toda resposta bem-sucedida é JSON ([RFC 9110 — status codes](https://www.rfc-editor.org/rfc/rfc9110.html#section-15)).

### 7. Separar estado local, estado de URL e estado de servidor

O estado de servidor tem ciclo de vida próprio: cache, invalidação, refetch, concorrência, falhas e sincronização. Não deve ser duplicado em vários `useState` apenas para atravessar componentes. No estado atual, o TanStack Router já cobre uma parte importante: seus loaders podem pré-carregar e armazenar temporariamente dados da rota; `loaderDeps` informa quais dependências devem causar novo carregamento ([TanStack Router — Data Loading](https://tanstack.com/router/latest/docs/guide/data-loading)).

Recomendação por tipo de estado:

| Estado                                                 | Dono recomendado no Economize                                                   |
| ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| filtro, mês, paginação, ordenação compartilhável       | search params validados pelo TanStack Router                                    |
| dados exigidos para entrar em uma rota                 | loader da rota, consumindo serviço                                              |
| cache compartilhado, deduplicação, refetch e mutations | TanStack Query, quando a necessidade surgir                                     |
| modal, campo em edição, seleção visual                 | estado local do componente ou formulário                                        |
| sessão                                                 | política da API e camada de autenticação, não um guard visual no layout privado |

Se TanStack Query for adotado, as query keys devem ser arrays serializáveis, únicas para os dados e incluir toda variável usada pela função de consulta; a documentação chama essas variáveis de dependências do cache ([TanStack Query — Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)). Após uma mutation, deve-se invalidar as queries afetadas em vez de espalhar atualizações manuais; `invalidateQueries` marca dados como stale e pode refazer a busca em background ([TanStack Query — Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)).

Também é importante conhecer os defaults: queries stale podem ser refetchadas ao montar, ao focar a janela ou ao reconectar. O `staleTime` deve refletir a volatilidade de cada recurso, não ser escolhido globalmente por hábito ([TanStack Query — Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)).

Para a integração Router + Query, a documentação oficial mostra passar `QueryClient` pelo contexto do Router e usar o loader para `ensureQueryData`/prefetch, evitando waterfalls e mantendo a rota declarativa ([TanStack Router — TanStack Query Integration](https://tanstack.com/router/latest/docs/integrations/query), [TanStack Query — Prefetching & Router Integration](https://tanstack.com/query/latest/docs/framework/react/guides/prefetching)). Isso seria uma etapa posterior ao primeiro movimento de retirar chamadas HTTP das telas.

## Plano de adoção recomendado

### Fase 1 — fronteira HTTP e serviços

- preservar `src/lib/api.ts` como cliente único;
- estabelecer uma convenção para `service` receber `signal` e devolver dados já validados;
- implementar operações em `auth`, `accounts` e `categories` antes de criar mais abstrações;
- mover gradualmente chamadas diretas de [`src/lib/summary.ts`](../../src/lib/summary.ts) e das rotas para os serviços;
- manter regras de navegação (`401`) no cliente compartilhado e mensagens de tela fora dele.

### Fase 2 — schemas e erros

- criar schemas de request/response por domínio;
- escolher `parse` ou `safeParse` por caso de uso e registrar o motivo;
- definir o erro normalizado e o formato Problem Details esperado do backend;
- documentar quais status são esperados por operação e quais podem ser repetidos com segurança.

### Fase 3 — loaders e cache

- usar loaders do Router para dados necessários à rota, passando o `signal` para os serviços;
- manter `loaderDeps` mínimo e derivado de search params validados;
- medir a necessidade de cache compartilhado, refetch e mutations;
- só então introduzir TanStack Query, com `QueryClient` único, query keys por domínio e invalidação após mutation.

### Fase 4 — contrato gerado, se houver OpenAPI

- obter a especificação OpenAPI versionada e validada pelo backend;
- gerar tipos com `openapi-typescript` em uma etapa reproduzível do projeto;
- avaliar Orval para geração de hooks se isso reduzir código sem duplicar a política Ky;
- manter schemas Zod onde a validação runtime for necessária: tipos gerados não substituem a validação do JSON recebido;
- falhar no CI quando a especificação ou os tipos gerados mudarem de modo incompatível.

## Decisões e limites

- **Não recomendar um store global genérico:** o problema descrito é estado de servidor; Query/Router têm semântica mais adequada que um store de estado local.
- **Não colocar fetch em componentes:** componentes devem consumir serviço, loader ou query; isso reduz race conditions, waterfalls e acoplamento a transporte.
- **Não tratar TypeScript como validação de resposta:** `json<T>()` apenas informa ao compilador uma intenção; o schema Zod é o guard runtime.
- **Não centralizar regras de domínio no cliente Ky:** centralizar transporte é desejável; centralizar decisões de negócio cria um módulo raso e difícil de evoluir.
- **Não adotar geração de cliente por antecipação:** sem OpenAPI estável, geração acrescenta custo de build e acopla o frontend a uma especificação que ainda pode não ser a fonte de verdade.

## Fontes primárias consultadas

- [React — You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [React — Synchronizing with Effects](https://react.dev/learn/synchronizing-with-effects)
- [TanStack Router — Data Loading](https://tanstack.com/router/latest/docs/guide/data-loading)
- [TanStack Router — Search Params](https://tanstack.com/router/latest/docs/guide/search-params)
- [TanStack Router — TanStack Query Integration](https://tanstack.com/router/latest/docs/integrations/query)
- [TanStack Query — Query Keys](https://tanstack.com/query/latest/docs/framework/react/guides/query-keys)
- [TanStack Query — Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)
- [TanStack Query — Important Defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
- [TanStack Query — Prefetching & Router Integration](https://tanstack.com/query/latest/docs/framework/react/guides/prefetching)
- [Zod — Basic usage](https://zod.dev/basics)
- [Ky — README oficial](https://github.com/sindresorhus/ky/blob/main/readme.md)
- [OpenAPI TypeScript — documentação](https://openapi-ts.dev/introduction)
- [OpenAPI TypeScript — README oficial](https://github.com/openapi-ts/openapi-typescript)
- [OpenAPI TypeScript — roadmap de 2026](https://github.com/openapi-ts/openapi-typescript/discussions/2559)
- [Orval — React Query](https://orval.dev/docs/guides/react-query/)
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html)
