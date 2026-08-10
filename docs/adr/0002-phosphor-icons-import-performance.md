# ADR-0002: Import Performance Optimization

## Status

Aceito

## Contexto

O pacote `@phosphor-icons/react` exporta milhares de módulos pelo entrypoint principal. Durante o desenvolvimento, alguns bundlers podem transpilar esses módulos de forma antecipada mesmo quando poucos ícones são usados, aumentando significativamente o tempo de compilação.

## Decisão

Os ícones Phosphor devem ser importados individualmente pelos caminhos de arquivo em `@phosphor-icons/react/dist/csr/<IconName>`, em vez de serem importados do módulo principal `@phosphor-icons/react`.

Exemplo:

```tsx
import { BellSimpleIcon } from "@phosphor-icons/react/dist/csr/BellSimple";
```

## Consequências

- Reduz o número de módulos processados durante o desenvolvimento.
- Torna cada dependência visual explícita no arquivo que a utiliza.
- Novos ícones devem seguir o mesmo padrão de importação individual.
- A atualização da biblioteca deve confirmar que os caminhos `dist/csr` continuam disponíveis.
