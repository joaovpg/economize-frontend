# Validação e comandos

## Configuração

- As configurações executáveis são a autoridade: leia `.oxlintrc.json`, `.oxfmtrc.json` e os arquivos de TypeScript antes de alterar regras ou comandos.
- Oxlint é o lint oficial. Não substitua Oxlint por ESLint nem desative regras globalmente para fazer uma mudança passar. Exceções devem ser locais, mínimas e justificadas.
- O projeto usa lint type-aware e a checagem do compilador TypeScript. Preserve essas verificações.
- Oxfmt é o formatador oficial. Não introduza Prettier ou outra ferramenta de formatação; a formatação, a ordenação de imports, a ordenação de classes Tailwind e a ordenação do `package.json` pertencem ao Oxfmt configurado.
- Preserve a configuração do React Compiler via Oxc em `vite.config.ts`; não a desabilite nem a substitua por outro fluxo sem um motivo concreto.

## Comandos auxiliares

- `pnpm dev` inicia o servidor Vite com HMR.
- `pnpm fmt` aplica a formatação.
- `pnpm lint:fix` aplica correções automáticas do lint; use-o somente quando a correção automática for intencional e puder ser revisada.
- `pnpm preview` serve o build de produção e só deve ser executado depois de `pnpm build`.

## Testes

Atualmente não há framework nem script de testes configurado. Não invente `pnpm test`, não instale uma solução de testes por conta própria e não trate uma verificação inexistente como concluída. Uma estratégia de testes deve fazer parte de uma tarefa explícita.
