# Desenvolvimento e validação

Consulte este guia ao instalar dependências, executar o projeto ou validar uma alteração.

## Comandos

- Instale dependências com `pnpm install`.
- Inicie o servidor Vite com `pnpm dev`.
- Formate arquivos com `pnpm fmt`; confirme a formatação com `pnpm fmt:check`.
- Execute o lint com `pnpm lint`; use `pnpm lint:fix` somente quando quiser aplicar correções
  automáticas.
- Gere e verifique o build de produção com `pnpm build`.
- Use `pnpm preview` somente depois de um `pnpm build` bem-sucedido.

## Ferramentas

- Oxfmt define a formatação e a ordenação de imports em `.oxfmtrc.json`.
- Oxlint define as regras de lint em `.oxlintrc.json`.
- As configurações `tsconfig*.json` são a fonte de verdade para as restrições de TypeScript.
- Não há script de testes configurado. Ao adicionar um, atualize também o fluxo de validação
  documentado no `AGENTS.md` raiz.
