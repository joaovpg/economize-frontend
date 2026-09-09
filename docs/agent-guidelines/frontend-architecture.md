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
- Prefira loaders para obter os dados necessários à rota e mantenha o acesso a dados separado da renderização.
- Use `src/lib/api.ts` nas integrações HTTP. O cliente envia cookies com `credentials: "include"` e redireciona para `/login` ao receber `401` fora das rotas públicas.
- Mantenha `PrivateLayout` sem guard de sessão: a API valida a sessão. O grupo `_private` organiza as telas e não comprova autenticação.
- Atualmente, resumo e detalhes de transação usam dados locais de demonstração em `src/lib/summary.ts`; suas funções assíncronas não representam integração com a API.

Para a motivação e as consequências do roteamento adotado, consulte [ADR-0004](../adr/0004-code-splitting-por-grupo-de-rotas.md).
