# Arquitetura frontend

## Organização

- `src/routes/` contém os módulos de rota e as telas específicas de cada rota. Use o prefixo `-` em arquivos e diretórios auxiliares exclusivos da rota para excluí-los da geração de rotas.
- Os layouts de grupo ficam em `src/routes/_public/route.tsx` e `src/routes/_private/route.tsx`.
- `src/components/` contém componentes reutilizáveis entre telas.
- `src/lib/` contém acesso a dados, schemas e funções compartilhadas, incluindo o cliente HTTP Ky.

## Rotas e carregamento

- Use o roteamento baseado em arquivos do TanStack Router: `createRootRoute` em `__root.tsx` e `createFileRoute` nos demais módulos de rota.
- Declare somente as opções necessárias à rota. Aproveite os boundaries de carregamento, erro e página não encontrada compartilhados na raiz e nos layouts; especialize-os quando necessário.
- Mantenha `PublicLayout` e `PrivateLayout` síncronos; cada layout hospeda seu `Outlet` e o limite de `Suspense` com `LoadingPage` como fallback.
- `/login` e `/cadastro` pertencem ao grupo `_public`; as telas da área privada, ao `_private`. A rota `/` fica fora desses grupos e redireciona para `/login`; o fallback 404 fica na raiz.
- Use o `Link` compartilhado de `src/components/Link.tsx` para navegação interna tipada.

## Estado na URL e dados

- Mantenha na URL o estado da tela que precisa ser compartilhado ou restaurado, validando os search params com `validateSearch`. Use `loaderDeps` somente para valores que afetam os dados carregados. No resumo, o mês afeta o loader; os demais filtros são aplicados localmente.
- Use os loaders para garantir as consultas necessárias à entrada da rota com `context.queryClient.ensureQueryData(...)`. As telas devem ler os dados com `useSuspenseQuery(...)`, deixando cache, deduplicação e atualização sob responsabilidade do TanStack Query.
- Mantenha `queryOptions` e query keys próximas dos serviços de domínio em `src/services/<domínio>/queries.ts`. Toda variável usada pela função de consulta deve estar na query key, e a função deve encaminhar o `signal` recebido pelo TanStack Query ao serviço HTTP.
- Após uma operação mutável, use `useMutation` e invalide a query do domínio com `queryClient.invalidateQueries(...)`. Não use `router.invalidate()` para substituir a invalidação do estado de servidor.
- Use `src/lib/api.ts` nas integrações HTTP. O cliente envia cookies com `credentials: "include"` e redireciona para `/login` ao receber `401` fora das rotas públicas.
- Mantenha `PrivateLayout` sem guard de sessão: a API valida a sessão. O grupo `_private` organiza as telas e não comprova autenticação.
- A consulta de transações usa o serviço de domínio em `src/services/transactions/`, com contratos Zod na fronteira HTTP e cache no TanStack Query. O resumo não possui rota correspondente na API e permanece com estado vazio, sem dados demonstrativos.

O `QueryClient` único é criado em `src/main.tsx`, fornecido pelo `QueryClientProvider` e exposto ao Router pelo contexto tipado da raiz. O projeto é uma SPA Vite; por isso, não usa o adaptador SSR do TanStack Router Query.

Para a motivação e as consequências do roteamento adotado, consulte [ADR-0004](../adr/0004-code-splitting-por-grupo-de-rotas.md).
