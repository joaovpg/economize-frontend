# Integração do TanStack Query com o TanStack Router

**Status:** Aceito

O frontend adota `@tanstack/react-query` como dono do estado de servidor, trabalhando em conjunto com o TanStack Router. Um `QueryClient` único é fornecido ao React e ao contexto tipado do Router; os loaders usam `ensureQueryData` para garantir consultas antes da renderização, enquanto as telas usam `useSuspenseQuery` para ler o cache. As query options ficam próximas dos serviços de contas, categorias e transações, com query keys que incluem todas as dependências do resultado e `signal` encaminhado ao cliente Ky.

As operações mutáveis existentes usam `useMutation` e invalidam as queries do domínio após sucesso. O estado de filtros continua nos search params do Router, e estado local de modal/formulário permanece nos componentes. Contas e categorias usam `staleTime` de cinco minutos; transações usam 30 segundos. O retry automático do Query fica desabilitado porque a política de retry HTTP permanece centralizada no Ky, evitando repetições multiplicadas.

O projeto é uma SPA Vite, então não adiciona o adaptador SSR do Router Query. Esta decisão segue o padrão de integração documentado pelo TanStack para expor o `QueryClient` no contexto do Router e pré-carregar consultas pelo loader: [TanStack Router — TanStack Query Integration](https://tanstack.com/router/latest/docs/integrations/query).

## Consequências

- Navegações entre resumo e transações compartilham e deduplicam contas e categorias no mesmo cache.
- Mutations não precisam invalidar a árvore inteira do Router; invalidam apenas as consultas do domínio afetado.
- Os loaders continuam sendo a fronteira de entrada da rota, mas não duplicam o armazenamento de dados mantido pelo Router.
- A adoção de SSR exigirá reavaliar a inclusão de `@tanstack/react-router-ssr-query` e a criação de um `QueryClient` por requisição no ambiente de servidor.
