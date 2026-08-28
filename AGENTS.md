# Instruções para agentes

O Economize é um frontend React para registrar e controlar receitas, despesas, contas, categorias, recorrências e transferências.

## Regras essenciais

- Use exclusivamente `pnpm`.
- Antes de entregar uma mudança relevante, execute, nesta ordem, `pnpm fmt:check`, `pnpm lint` e `pnpm build`.
- `pnpm build` é o gate de typecheck e produção: executa `tsc -b` e depois `vite build`.

## Instruções por assunto

Consulte somente os guias aplicáveis à tarefa:

- [Convenções de projeto](docs/agents/project-conventions.md): dependências, bibliotecas adotadas e organização do código.
- [Texto e formatos do produto](docs/agents/product-content.md): idioma, terminologia e convenções brasileiras de exibição.
- [Estilos e design system](docs/agents/styling.md): Tailwind CSS, `tailwind-variants`, tokens e CSS customizado.
- [Validação e comandos](docs/agents/validation.md): ferramentas, scripts auxiliares e política de testes.
- [Contexto e documentação](docs/agents/workflow.md): quando consultar produto, domínio, design, ADRs e especificações.
- [Issue tracker local](docs/agents/issue-tracker.md): estrutura e operação das issues em Markdown.
- [Índice completo e estrutura de `docs/`](docs/agents/README.md).
