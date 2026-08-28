# Arquitetura frontend

Consulte este guia ao alterar rotas, layouts, carregamento de páginas ou integrações.

## Organização

- `src/pages/` contém páginas e estados de rota.
- `src/components/` contém componentes reutilizáveis e layouts compartilhados.
- `src/lib/` contém integrações, incluindo o cliente HTTP baseado em Ky.
- `src/styles/tokens/` contém os tokens visuais.
- `public/` contém arquivos servidos diretamente pela raiz do site.

## Rotas e carregamento

- Carregue páginas de rota com `React.lazy` diretamente em `src/App.tsx`.
- Mantenha `PublicLayout` e `PrivateLayout` síncronos; cada layout hospeda seu limite de
  `Suspense` e usa `LoadingPage` como fallback.
- Trate `/login` e `/cadastro` como rotas públicas. As demais rotas pertencem ao layout privado.
- Não adicione um guard de sessão ao `PrivateLayout`: a API valida a sessão e o frontend reage a
  respostas `401`.

Leia a decisão completa em
[ADR-0004](../adr/0004-code-splitting-por-grupo-de-rotas.md).
