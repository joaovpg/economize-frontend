# Desenvolvimento e validação

## Comandos

- Use a versão de Node em [.node-version](../../.node-version) e a de pnpm no campo
  `packageManager` do [package.json](../../package.json). Instale dependências com
  `pnpm install --frozen-lockfile`; ao alterar dependências, atualize também o lockfile.
- Consulte os scripts em [package.json](../../package.json) para executar o projeto ou aplicar formatação e correções de lint.
- Use `pnpm preview` somente depois de um `pnpm build` bem-sucedido.
- `pnpm check` é a validação final. Informe o resultado de cada etapa, incluindo falhas
  preexistentes ou comandos não concluídos. Um comando interrompido não comprova sucesso.
- `pnpm typecheck` verifica os projetos referenciados pelo `tsconfig.json` sem executar o Vite.
  O modo build do TypeScript é necessário porque a configuração raiz apenas referencia
  os projetos da aplicação e das ferramentas. O build da aplicação já inclui essa verificação.
- Para uma alteração de comportamento ou interface, verifique também o fluxo afetado na
  aplicação e descreva o que observou. Se depender de API ou credenciais indisponíveis,
  informe essa limitação. Os checks estáticos não comprovam o comportamento em execução.
- Ao adicionar um script de testes, atualize esse fluxo de validação.

## Exceções

- Resolva diagnósticos preservando o contrato do código. Use tipos específicos e valide
  dados externos, em vez de recorrer a `any`, coerções ou `@ts-ignore` para obter sucesso.
- Quando uma limitação real exigir supressão, limite-a à linha e à regra afetadas e
  registre o motivo concreto no comentário. Para TypeScript, prefira `@ts-expect-error`
  com justificativa, pois ele acusa quando o erro esperado deixa de existir.
- Mudanças em regras, exclusões ou opções do compilador devem corrigir uma incompatibilidade
  demonstrável e ter o motivo informado na entrega. Passar a validação, por si só, não
  justifica enfraquecer uma verificação.
- Preserve as exceções do gerador de rotas; a correção deve ocorrer na fonte ou configuração
  do gerador, sem editar o arquivo gerado.

## Ferramentas

- Oxfmt define a formatação e a ordenação de imports em `.oxfmtrc.json`.
- Oxlint define as regras de lint em `.oxlintrc.json`.
- As configurações `tsconfig*.json` são a fonte de verdade para as restrições de TypeScript.

### Regras SonarJS no Oxlint

O `pnpm lint` também executa regras de `eslint-plugin-sonarjs`, sem um segundo linter.
A seleção explícita em `.oxlintrc.json` complementa as regras nativas com diagnósticos
de lógica, segurança, React e acessibilidade aplicáveis a este frontend. Regras de AWS,
servidores HTTP, frameworks ausentes e sugestões apenas estilísticas ficam fora dessa
seleção. A regra nativa de variáveis não utilizadas substitui a equivalente do SonarJS.
O Oxfmt continua responsável pela formatação.

Ao atualizar o plugin, revise essa seleção explícita. Carregar o plugin em
`jsPlugins` não habilita automaticamente suas regras recomendadas.

O suporte a tipos das regras nativas do Oxlint não se estende aos plugins
JavaScript. Por isso, regras SonarJS que exigem tipos ficam fora da seleção,
incluindo `sonarjs/prefer-immediate-return`. Consulte as
[limitações dos plugins JavaScript](https://oxc.rs/docs/guide/usage/linter/js-plugins.html).
O SonarQube for IDE pode apresentar avisos adicionais: essa configuração amplia
a cobertura no terminal, mas não garante equivalência com o analisador da IDE.
O lint bloqueia erros e avisos, incluindo supressões de lint sem uso. Assim, os avisos
mantidos na configuração também exigem resolução antes da conclusão.

## Integração contínua

O workflow [Qualidade](../../.github/workflows/quality.yml) executa a mesma validação local
em pushes e pull requests, com instalação pelo lockfile congelado. As versões de Node e
pnpm vêm dos arquivos do projeto. As ações são fixadas por commit; revise suas versões ao
atualizar o workflow. Para exigir sucesso antes do merge, configure o check `pnpm check`
nas regras de proteção da branch no GitHub.

## Referências

- [Oxc: integração com agentes](https://oxc.rs/docs/guide/usage/coding-agents.html), uso de
  lint e formatação no ciclo de edição e bloqueio de avisos.
- [Anthropic: verificação do trabalho](https://code.claude.com/docs/en/best-practices),
  retorno executável e evidências de comportamento.
- [OpenAI: experiência com agentes em repositórios](https://openai.com/index/harness-engineering/),
  convenções verificáveis e documentação organizada por contexto.

## Ambiente e arquivos gerados

- Configure `VITE_API_URL` no ambiente para as chamadas do cliente HTTP em `src/lib/api.ts`.
- `src/routeTree.gen.ts` é gerado pelo plugin do TanStack Router durante `pnpm dev` e
  `pnpm build`. Altere os módulos de rota e deixe o plugin atualizar a árvore; não a edite à mão.
