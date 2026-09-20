# Economize frontend

Frontend React do Economize, uma aplicação web para registrar, entender e controlar finanças pessoais.

## Essencial

- Use `pnpm` como gerenciador de pacotes.
- Antes de concluir uma alteração, execute, nesta ordem: `pnpm fmt:check`, `pnpm lint` e
  `pnpm build`.
- `pnpm build` é também a verificação de tipos: ele executa `tsc -b` antes do build do Vite.
- O projeto ainda não possui script ou framework de testes; não declare testes como executados.

## Instruções por contexto

- Ao configurar o ambiente ou validar alterações, consulte
  [Desenvolvimento e validação](docs/agent-guidelines/development.md).
- Ao alterar rotas, layouts, estado na URL ou acesso a dados, consulte
  [Arquitetura frontend](docs/agent-guidelines/frontend-architecture.md).
- Ao criar componentes, formulários ou estilos, consulte
  [Interface e estilos](docs/agent-guidelines/ui-and-styling.md).
- Antes de mudar uma decisão arquitetural, consulte os [ADRs aceitos](docs/adr/).
