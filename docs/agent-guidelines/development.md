# Desenvolvimento e validação

## Comandos

- Consulte os scripts em [package.json](../../package.json) para executar o projeto ou aplicar formatação e correções de lint.
- Use `pnpm preview` somente depois de um `pnpm build` bem-sucedido.
- Siga a sequência de validação do [AGENTS.md](../../AGENTS.md#essencial) e informe o resultado de cada verificação, incluindo falhas preexistentes ou comandos não concluídos.
- Ao adicionar um script de testes, atualize esse fluxo de validação.

## Ferramentas

- Oxfmt define a formatação e a ordenação de imports em `.oxfmtrc.json`.
- Oxlint define as regras de lint em `.oxlintrc.json`.
- As configurações `tsconfig*.json` são a fonte de verdade para as restrições de TypeScript.

## Ambiente e arquivos gerados

- Configure `VITE_API_URL` no ambiente para as chamadas do cliente HTTP em `src/lib/api.ts`.
- `src/routeTree.gen.ts` é gerado pelo plugin do TanStack Router durante `pnpm dev` e
  `pnpm build`. Altere os módulos de rota e deixe o plugin atualizar a árvore; não a edite à mão.
