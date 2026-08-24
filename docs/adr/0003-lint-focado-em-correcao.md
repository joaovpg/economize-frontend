# ADR-0003: Lint Focado Em Correção

## Status

Aceito

## Contexto

O projeto usa Oxlint, Oxfmt e Tailwind CSS. A configuração inicial habilitava categorias amplas e várias regras de estilo Tailwind, o que misturava problemas de correção com preferências de formatação. O histórico do projeto mostra que o lint começou pequeno e foi ampliado gradualmente.

## Decisão

O lint bloqueará apenas problemas explícitos de correção, segurança básica, acessibilidade essencial, Promises e classes Tailwind inválidas ou conflitantes. Categorias implícitas do Oxlint permanecerão desligadas para que novas regras não sejam ativadas acidentalmente.

Regras de formatação e estilo visual ficarão sob responsabilidade do Oxfmt. O lint type-aware será habilitado com `oxlint-tsgolint`; regras de Promises serão erros, enquanto regras `unsafe` começarão como avisos. Avisos não bloquearão `pnpm lint`.

## Consequências

- Classes Tailwind desconhecidas, duplicadas, conflitantes ou depreciadas bloqueiam a validação.
- Problemas de hooks, imports cíclicos, acessibilidade de imagens e Promises não tratadas bloqueiam a validação.
- A tipagem insegura fica visível sem interromper a adoção inicial.
- A atualização do TypeScript para a versão 7 passa a ser requisito do lint type-aware.
- Novas regras devem ser adicionadas explicitamente, com justificativa, em vez de habilitar categorias inteiras.
