# Documentação de domínio

Consulte este guia quando a tarefa envolver terminologia do domínio ou decisões arquiteturais.

## Fontes de verdade

- Leia `CONTEXT.md` e use a terminologia definida no glossário.
- Leia em `docs/adr/` somente os ADRs relacionados à área que será alterada.

## Vocabulário

- Ao nomear um conceito de domínio em código, documentação, issue, proposta de refatoração ou hipótese, use o termo definido em `CONTEXT.md`.
- Não substitua um termo do glossário por um sinônimo que ele rejeite explicitamente.
- Se um conceito necessário não existir no glossário, verifique se a linguagem já aparece no produto ou no código. Se a lacuna for real, registre-a para uma decisão de domínio.

## Conflitos com ADRs

- Se uma proposta contrariar um ADR existente, explicite o conflito em vez de sobrescrever silenciosamente a decisão.
