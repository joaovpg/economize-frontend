# Economize frontend

Frontend React do Economize, uma aplicação web para registrar, entender e controlar finanças pessoais.

## Essencial

- Use `pnpm` como gerenciador de pacotes.
- Antes de concluir uma alteração, execute `pnpm check` e informe o resultado. A sequência
  de verificações está definida no `package.json` e também é executada no CI.
- Corrija a causa dos diagnósticos; preserve as verificações e a segurança dos tipos.
  Para exceções de lint ou TypeScript, siga a política de
  [Desenvolvimento e validação](docs/agent-guidelines/development.md#exceções).
- O projeto ainda não possui script ou framework de testes; não declare testes como executados.

## Instruções por contexto

- Ao configurar o ambiente ou validar alterações, consulte
  [Desenvolvimento e validação](docs/agent-guidelines/development.md).
- Ao alterar rotas, layouts, estado na URL ou acesso a dados, consulte
  [Arquitetura frontend](docs/agent-guidelines/frontend-architecture.md).
- Ao criar componentes, formulários ou estilos, consulte
  [Interface e estilos](docs/agent-guidelines/ui-and-styling.md).
- Antes de mudar uma decisão arquitetural, consulte os [ADRs aceitos](docs/adr/).
