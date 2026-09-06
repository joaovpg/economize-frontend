# Economize

Frontend React do Economize, uma aplicação web para controle financeiro.

## Sobre o projeto

Projeto pessoal para registro e acompanhamento de gastos. O objetivo é permitir o gerenciamento de transações, transferências, transações recorrentes, categorias e contas financeiras.

## Tecnologias

- React
- TypeScript
- Vite
- TanStack Router (rotas baseadas em arquivos)
- Tailwind CSS
- Ky
- React Hook Form
- Zod

## Requisitos

- Node.js
- pnpm

## Configuração

Copie o arquivo `.env.example` para `.env` e preencha a URL da API:

```env
VITE_API_URL=
```

## Scripts

| Comando          | Descrição                                           |
| ---------------- | --------------------------------------------------- |
| `pnpm dev`       | Inicia o servidor de desenvolvimento                |
| `pnpm build`     | Compila o código para produção                      |
| `pnpm lint`      | Verifica o código em busca de erros                 |
| `pnpm fmt:check` | Verifica a formatação do código                     |
| `pnpm preview`   | Inicia o servidor local com a aplicação em produção |

## Desenvolvimento

Instale as dependências com `pnpm` e inicie o servidor de desenvolvimento:

```bash
pnpm install
pnpm dev
```

O servidor Vite oferece atualização automática durante o desenvolvimento.

## Verificações antes de entregar

Execute os comandos abaixo na ordem indicada antes de entregar uma alteração:

```bash
pnpm fmt:check
pnpm lint
pnpm build
```

`pnpm preview` disponibiliza o build de produção localmente e deve ser executado somente depois de
`pnpm build`.

O projeto usa Oxfmt para formatação, Oxlint para lint e TypeScript com Vite para o build. O React Compiler está habilitado pela configuração nativa do Oxc. Ainda não há framework ou script de testes configurado neste repositório.

## Organização

- `src/routes/` contém as rotas tipadas, seus loaders e as telas colocalizadas; arquivos e diretórios
  com prefixo `-` são auxiliares ignorados pelo gerador.
- `src/routeTree.gen.ts` é gerado pelo plugin do TanStack Router e não deve ser editado manualmente.
- `src/components/` contém componentes reutilizáveis e layouts compartilhados.
- `src/lib/` contém integrações, incluindo o cliente HTTP baseado em Ky.
- `src/styles/tokens/` contém os tokens visuais do projeto.
- `public/` contém arquivos servidos diretamente pela raiz do site.

## Roteamento

O plugin do TanStack Router gera a árvore de rotas durante o desenvolvimento e o build. O roteador
usa preloading por intenção, boundaries de carregamento/erro e code splitting automático por rota.
O resumo mantém mês, filtros e estado de expansão do ledger na URL para que a visão possa ser
compartilhada e restaurada diretamente.

## Status

Em desenvolvimento.
