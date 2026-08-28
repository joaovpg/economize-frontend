# Convenções de projeto

## Fontes de verdade e dependências

- Leia `package.json` antes de escolher uma biblioteca, propor um script ou assumir a stack do projeto.
- Use `package.json` como fonte de verdade para dependências diretas, scripts e classificação entre runtime e desenvolvimento.
- Consulte `pnpm-lock.yaml` quando a tarefa envolver versões resolvidas, reprodução do ambiente ou atualização de dependências.
- Não instale, remova ou substitua bibliotecas por iniciativa própria. Uma nova dependência exige solicitação explícita e justificativa.
- Quando uma alteração de dependência for autorizada, atualize `package.json` e `pnpm-lock.yaml` juntos, usando os comandos do `pnpm`, e revise o impacto no projeto.
- Não copie versões de dependências para a documentação; o manifesto e o lockfile são a autoridade executável.

## Responsabilidade das bibliotecas

- Use React Router para rotas e as APIs nativas do React (`useState`, `useReducer` e `Context` quando necessário) para o estado da aplicação. Não introduza uma biblioteca externa de estado ou roteamento sem decisão explícita.
- Use React Hook Form exclusivamente para o estado e a submissão de formulários; use Zod para schemas e validação e `@hookform/resolvers` para a integração.
- Use React Aria Components para controles interativos acessíveis, preservando semântica HTML, teclado, foco e estados ARIA.
- Use `ky` como cliente HTTP oficial.
- Use Phosphor Icons para ícones. Prefira os imports individuais definidos no [ADR-0002](../adr/0002-phosphor-icons-import-performance.md); use SVG próprio somente quando o ícone de domínio não existir na biblioteca.
- Siga as regras de Tailwind CSS e `tailwind-variants` no [guia de estilos](styling.md).

## Organização do código

- `src/main.tsx` é o entrypoint do navegador e renderiza `src/App.tsx`.
- `src/pages/**` contém páginas e estados de rota.
- `src/components/**` contém componentes reutilizáveis.
- `src/components/layouts/**` contém layouts compartilhados.
- Mantenha as receitas de estilo próximas do componente que as utiliza; quando uma receita crescer, extraia-a para um arquivo dedicado próximo ao componente.
- `src/lib/**` contém integrações e código de infraestrutura, incluindo acesso HTTP.
- `src/styles/tokens/**` contém os tokens visuais existentes; `src/styles/index.css` importa a folha global.
- `src/assets/**` contém assets processados pelo bundler; `public/**` contém arquivos servidos diretamente na raiz do site.
