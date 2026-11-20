# Arquitetura frontend

## Organização

- `src/routes/` contém os módulos de rota e as telas específicas de cada rota. Use o prefixo `-` em arquivos e diretórios auxiliares exclusivos da rota para excluí-los da geração de rotas.
- Os layouts de grupo ficam em `src/routes/_public/route.tsx` e `src/routes/_private/route.tsx`.
- `src/components/` contém componentes reutilizáveis entre telas. Os campos de formulário ficam em `src/components/fields/`, montados a partir dos primitivos de `src/components/primitives/` (ver [Campos de formulário](ui-and-styling.md#campos-de-formulário)).
- `src/lib/` contém acesso a dados, schemas e funções compartilhadas, incluindo o cliente HTTP Ky e o `ApiError`.
- Schemas de formulário ficam nos `-components` da rota (por exemplo, `transaction-form.ts`); os `contracts.ts` dos serviços guardam somente os contratos da API.

## Rotas e carregamento

- Use o roteamento baseado em arquivos do TanStack Router: `createRootRoute` em `__root.tsx` e `createFileRoute` nos demais módulos de rota.
- Rotas são privadas por padrão. Uma rota nova entra em `_private`; ela só fica em `_public` quando for explicitamente pública. `/login` e `/cadastro` pertencem a `_public`; a rota `/` fica fora dos grupos e redireciona para `/login`; o fallback 404 fica na raiz.
- O code splitting é automático por rota. Os grupos organizam layouts e não exigem um chunk único por grupo. O router usa preloading por intenção (`defaultPreload: "intent"`). A composição exata dos chunks deve ser verificada no build.
- Declare somente as opções necessárias à rota. Aproveite os boundaries de carregamento, erro e página não encontrada compartilhados na raiz e nos layouts; especialize-os quando necessário.
- Mantenha `PublicLayout` e `PrivateLayout` síncronos; cada layout hospeda seu `Outlet` e o limite de `Suspense` com `LoadingPage` como fallback.
- Use o `Link` compartilhado de `src/components/Link.tsx` para navegação interna tipada.

## Estado na URL e dados

- Mantenha na URL o estado da tela que precisa ser compartilhado ou restaurado, validando os search params com `validateSearch`. Use `loaderDeps` somente para valores que afetam os dados carregados. No resumo, o mês afeta o loader; os demais filtros são aplicados localmente.
- Use os loaders para garantir as consultas necessárias à entrada da rota com `context.queryClient.query(queryOptions)`. Não sobrescreva `staleTime` no loader: a política de cache fica nas query options. As telas devem ler os dados com `useSuspenseQuery(...)`, deixando cache, deduplicação e atualização sob responsabilidade do TanStack Query.
- Mantenha `queryOptions` e query keys próximas dos serviços de domínio em `src/services/<domínio>/queries.ts`. Toda variável usada pela função de consulta deve estar na query key, e a função deve encaminhar o `signal` recebido pelo TanStack Query ao serviço HTTP.
- Política de cache: contas e categorias usam `staleTime` de 5 minutos; transações usam 30 segundos. O retry do `QueryClient` fica desligado, porque a política de retry HTTP fica centralizada no Ky.
- Após uma operação mutável, use `useMutation` e invalide a query do domínio com `queryClient.invalidateQueries(...)`. Não use `router.invalidate()` para substituir a invalidação do estado de servidor.
- Mantenha `PrivateLayout` sem guard de sessão: a API valida a sessão. O grupo `_private` organiza as telas e não comprova autenticação.

O `QueryClient` único é criado em `src/main.tsx`, fornecido pelo `QueryClientProvider` e exposto ao Router pelo contexto tipado da raiz. O projeto é uma SPA Vite; por isso, não usa o adaptador SSR do TanStack Router Query.

## Integrações HTTP

- Serviços ficam por domínio em `src/services/<domínio>/`, com `api.ts`, `contracts.ts` e, quando houver consultas, `queries.ts`. O cliente Ky em `src/lib/api.ts` é a infraestrutura compartilhada.
- Requests e responses são validados na fronteira por schemas Zod, com tipos inferidos desses schemas.
- Erros são normalizados em `ApiError` (`src/lib/api-errors.ts`) a partir do Problem Details do backend, incluindo erros HTTP, de rede, timeout e de contrato. Cancelamentos continuam sendo cancelamentos.
- Nomes de operação seguem o domínio e a rota HTTP, como `postLogin` e `getCategorias`, para facilitar a comparação com o Swagger.
- Retries são conservadores: não há retry automático de `POST`, `PUT` nem `DELETE`. Com Versão de edição, repetir um `PUT` ou `DELETE` só produziria conflito. O login desativa retry (`retry: { limit: 0 }`).
- A autenticação usa cookie com `credentials: "include"`; o JavaScript não lê cookies nem infere cabeçalhos. O token CSRF é salvo após o login, enviado no cabeçalho `X-CSRF-Token` em métodos mutáveis (exceto nas requisições públicas de autenticação) e limpo quando a API responde `401`. O cliente redireciona para `/login` nesse caso, fora das rotas públicas.

## Transações

- A consulta de transações usa o serviço de domínio em `src/services/transactions/`, com contratos Zod e cache no TanStack Query. A requisição envia somente o período (`yyyy-MM`), que vem dos search params pelo `loaderDeps`.
- Contas, categorias e busca por texto são aplicadas localmente. A opção "Todas as contas" não é enviada à API.
- Os filtros da tela de transações ficam em um store Zustand persistido em `localStorage`, separado dos filtros do resumo. Login e cadastro limpam o store para os padrões. O mês permanece nos search params e, sem mês explícito, usa o mês atual.
- A busca por texto usa debounce de 300 ms. Seleções de conta, categoria e saldo anterior são aplicadas imediatamente.
- A API retorna valores assinados; `tipo` é nulo nas transferências. Transferências têm categoria nula; a origem `TRANSFERENCIA` aparece como a categoria "Transferência". As origens `TRANSACAO_RECORRENTE` e `PARCELA` são sinalizadas com ícone de recorrência. `SALDO_INICIAL_CONTA` é preservada na tabela como saldo inicial.
- Cada item é identificado na listagem por `chaveItem`. Edição e exclusão de transação simples ou ocorrência usam a Chave de edição (`chaveEdicao`) e a Versão de edição (`versaoEdicao`) da última leitura ou escrita; a chave é opaca e não é validada como UUID. Ocorrências de série enviam o escopo (`SOMENTE_ESTA` ou `ESTA_E_AS_PROXIMAS`), definido em `escoposDisponiveis`. Transferências são editadas e excluídas pelo `operacaoId`. Os erros de concorrência e de série (`VERSAO_DESATUALIZADA`, `RECURSO_NAO_ENCONTRADO`, `OCORRENCIA_EFETIVADA_APOS_CORTE`, `SEGMENTO_NAO_ATUAL`) têm mensagem orientativa em `getGuidedApiErrorMessage`.
- `saldoAbertura` aparece como saldo anterior em bloco separado quando "Incluir saldo anterior" está ativo.
- Indicadores e acumulados usam os itens visíveis. Com recorte por conta, categoria ou texto, o cenário começa em zero e é apresentado como projeção do recorte. O saldo de abertura agregado não é atribuído ao recorte, e o controle "Incluir saldo anterior" fica indisponível. Sem recorte, o cálculo usa `saldoAbertura` como base somente com o controle ativo.
- A tabela de transações é mobile first: em telas pequenas, cada linha se reorganiza como um bloco legível, sem rolagem horizontal.
- O resumo permanece com estado vazio até a API oferecer uma consulta própria de resumo. Não há dados demonstrativos nem fallback fictício.
