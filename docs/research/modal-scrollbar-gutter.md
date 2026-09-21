# Modal e `scrollbar-gutter`

## Resumo

A PR [heroui-inc/heroui#6566](https://github.com/heroui-inc/heroui/pull/6566) começou propondo `width: 100vw; max-width: 100%` para cobrir o gutter reservado pelo React Aria, mas foi fechada após a investigação mostrar que o problema real é de pintura do scrollbar nativo, não de largura do backdrop.

## Fatos verificados

- A issue [heroui-inc/heroui#6562](https://github.com/heroui-inc/heroui/issues/6562) relaciona o comportamento a `usePreventScroll`, que aplica `scrollbar-gutter: stable` e `overflow: hidden` no `html` quando a página usa o documento como container de rolagem.
- O autor da PR testou `100vw`, `max-width: 100%`, alteração do fundo do `html` e ocultação do scrollbar. A PR registra que `100vw` não alterou a pintura do gutter no Safari; `scrollbar-gutter: auto` removeu a faixa, mas introduziu deslocamento de conteúdo.
- A solução arquitetural indicada na PR é manter `html` permanentemente sem rolagem e mover a rolagem para um container interno. Assim, o `usePreventScroll` não precisa reservar um gutter no `html`.
- Neste projeto, `PrivateLayout` usa `min-h-svh` e deixa a rolagem no documento; não existe atualmente um container raiz com `overflow: auto` responsável pela rolagem principal.

## Decisão

`width: 100vw; max-width: 100%` não deve ser tratado como correção suficiente para este bug. O workaround atual, que altera `scrollbar-gutter` somente quando o overlay do `Modal` existe, resolve a faixa mas pode causar o deslocamento descrito pela PR.

Uma correção estrutural exigiria migrar a rolagem principal para um container interno e revisar a restauração de scroll do roteador antes de remover o workaround.

## Fontes

- [Issue #6562](https://github.com/heroui-inc/heroui/issues/6562)
- [PR #6566](https://github.com/heroui-inc/heroui/pull/6566)
- [React Aria Modal](https://react-aria.adobe.com/Modal)
