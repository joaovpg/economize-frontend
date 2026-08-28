# Economize

Frontend React do Economize, uma aplicação web para registrar, entender e controlar receitas,
despesas, contas, categorias, recorrências e transferências.

## Desenvolvimento

Instale as dependências com `pnpm` e inicie o servidor de desenvolvimento:

```bash
pnpm install
pnpm dev
```

O servidor Vite oferece atualização automática durante o desenvolvimento.

## Verificações

Execute os comandos abaixo na ordem indicada antes de entregar uma alteração:

```bash
pnpm fmt:check
pnpm lint
pnpm build
```

`pnpm preview` disponibiliza o build de produção localmente e deve ser executado somente depois de
`pnpm build`.

O projeto usa Oxfmt para formatação, Oxlint para lint e TypeScript com Vite para o build. O React
Compiler está habilitado pela configuração nativa do Oxc. Ainda não há framework ou script de testes
configurado neste repositório.

## Organização

- `src/pages/` contém páginas e estados de rota.
- `src/components/` contém componentes reutilizáveis e layouts compartilhados.
- `src/lib/` contém integrações, incluindo o cliente HTTP baseado em Ky.
- `src/styles/tokens/` contém os tokens visuais do projeto.
- `public/` contém arquivos servidos diretamente pela raiz do site.

As rotas públicas são `/login` e `/cadastro`. As demais rotas são privadas por padrão e dependem da
sessão reconhecida pela API.
