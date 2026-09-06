# ADR-0004: Code Splitting Por Grupo De Rotas

## Status

Aceito

## Contexto

O bundle inicial importava todos os layouts e telas da aplicação, embora cada visita precise de
apenas um grupo de rotas. A aplicação tem um grupo de autenticação e outro de rotas privadas, e
ambos precisam de um estado de carregamento enquanto seus módulos são obtidos sob demanda.

## Decisão

O TanStack Router será usado com roteamento baseado em arquivos e `autoCodeSplitting` habilitado
no plugin do Vite. Cada arquivo de rota declara seu componente, loaders e boundaries; telas e
estilos específicos podem ser colocalizados em arquivos ou diretórios prefixados com `-`, que não
entram na árvore gerada. O roteador usa preloading por intenção para obter o código e os dados de
uma rota quando o usuário demonstra interesse nela.

Os layouts permanecerão síncronos para hospedar seus próprios limites de `Suspense`:
`PublicLayout` para as rotas públicas e `PrivateLayout` para a área privada. Ambos envolverão o
`Outlet` com `LoadingPage` como fallback. O layout privado será apenas um shell com `Outlet`, sem
adicionar um guard de sessão, pois a validade da sessão é responsabilidade do backend e o frontend
reage a respostas `401`.

## Consequências

- O bundle inicial mantém o roteador, os layouts, o fallback e as dependências necessárias para iniciar a aplicação.
- Login, cadastro, resumo, detalhes de transação e 404 são baixados conforme suas rotas são
  renderizadas ou pré-carregadas.
- A experiência de carregamento é consistente entre os dois grupos de rotas.
- Os layouts permanecem visíveis enquanto as telas lazy das rotas são carregadas.
- A autenticação continuará podendo ser integrada depois sem precisar mudar a divisão dos chunks.
