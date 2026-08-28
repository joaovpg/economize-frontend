# Guias para agentes

Este diretório aplica divulgação progressiva às instruções do repositório. O `AGENTS.md` raiz contém apenas os gates e fatos universais; cada guia abaixo deve ser lido somente quando o assunto fizer parte da tarefa.

## Índice por assunto

- [Convenções de projeto](project-conventions.md): fontes de verdade, dependências, bibliotecas adotadas e organização do código.
- [Texto e formatos do produto](product-content.md): idioma, terminologia e formatos exibidos ao usuário.
- [Estilos e design system](styling.md): Tailwind CSS, `tailwind-variants`, tokens e CSS customizado.
- [Validação e comandos](validation.md): Oxfmt, Oxlint, TypeScript, scripts auxiliares e política de testes.
- [Contexto e documentação](workflow.md): roteamento para contexto de produto, domínio, design, ADRs e especificações locais.
- [Documentação de domínio](domain.md): glossário, terminologia e conflitos com decisões arquiteturais.
- [Issue tracker local](issue-tracker.md): organização das especificações e issues em `.scratch/`.
- [Rótulos de triagem](triage-labels.md): estados canônicos usados pelo issue tracker.

## Estrutura sugerida para `docs/`

```text
docs/
├── adr/                  # Decisões arquiteturais
└── agents/               # Instruções carregadas conforme o assunto
    ├── README.md         # Índice e roteamento
    ├── domain.md         # Vocabulário e decisões de domínio
    ├── issue-tracker.md  # Issues e especificações locais
    ├── product-content.md
    ├── project-conventions.md
    ├── styling.md
    ├── triage-labels.md
    ├── validation.md
    └── workflow.md
```

Os documentos globais `CONTEXT.md`, `PRODUCT.md` e `DESIGN.md` permanecem na raiz por serem fontes de verdade do projeto, não instruções operacionais para agentes.
