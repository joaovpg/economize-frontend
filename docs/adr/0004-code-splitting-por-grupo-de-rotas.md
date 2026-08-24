# ADR-0004: Code Splitting Por Grupo De Rotas

## Status

Aceito

## Contexto

O bundle inicial importava todos os layouts e páginas da aplicação, embora cada visita precise de apenas um grupo de rotas. A aplicação tem um grupo de autenticação e outro de rotas privadas, e ambos precisam de um estado de carregamento enquanto seus módulos são obtidos sob demanda.

## Decisão

As páginas das rotas serão carregadas com `React.lazy` diretamente em `src/App.tsx`. Os layouts permanecerão síncronos para hospedar seus próprios limites de `Suspense`: `AuthLayout` para autenticação e `AuthenticatedLayout` para a área de pessoa autenticada. Ambos envolverão o `Outlet` com a página síncrona e genérica `LoadingPage` como fallback. O layout autenticado será inicialmente apenas um shell com `Outlet`, sem adicionar um guard de sessão nesta etapa.

## Consequências

- O bundle inicial mantém o roteador, os layouts, o fallback e as dependências necessárias para iniciar a aplicação.
- Login, cadastro, dashboard e 404 passam a ser baixados quando o grupo correspondente for renderizado.
- A experiência de carregamento é consistente entre os dois grupos de rotas.
- Os layouts permanecem visíveis enquanto suas páginas lazy são carregadas.
- A autenticação continuará podendo ser integrada depois sem precisar mudar a divisão dos chunks.
