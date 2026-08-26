# Escala tipográfica semântica e estilo base de links

## Status

Aceito

## Decisão

A interface usa uma escala tipográfica semântica compartilhada baseada em papéis: display fluido,
title compacto, body, body-small, label, button e caption. Os estilos de interface usam tamanhos e
alturas de linha padronizados — 12/16, 14/20 e 16/24 como base — e pesos 400, 500, 600 e 700.
Valores fracionados próximos não devem ser criados por componente.

A variante `link` carrega sua tipografia padrão (`text-button`, peso 600 e altura de linha 20) no
contrato compartilhado de estilos. Ajustes de contexto, como o peso da navegação do cabeçalho,
permanecem no ponto de uso.

## Consequências

- Login, cadastro e componentes compartilhados mantêm hierarquia tipográfica consistente.
- Novos componentes devem preferir os utilitários semânticos antes de criar tamanhos locais.
- Mudanças na tipografia base de `Button` também podem afetar links, pois ambos compartilham a mesma
  variante visual.
