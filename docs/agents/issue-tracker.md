# Issue tracker local

As issues e especificações deste repositório ficam em arquivos Markdown dentro de `.scratch/`.

## Estrutura

- Use um diretório por feature: `.scratch/<feature-slug>/`.
- Salve a especificação em `.scratch/<feature-slug>/spec.md`.
- Salve cada issue de implementação em `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, com numeração iniciada em `01`. Não reúna tickets distintos em um único arquivo.
- Registre o estado em uma linha `Status:` próxima ao início da issue, usando os valores do [guia de rótulos](triage-labels.md).
- Acrescente comentários e histórico da conversa ao final do arquivo, sob o título `## Comments`.

## Operações solicitadas por skills

- Quando uma skill pedir para publicar no issue tracker, crie um arquivo em `.scratch/<feature-slug>/`, criando o diretório quando necessário.
- Quando uma skill pedir a issue relevante, leia o caminho ou o número informado pelo usuário.

## Operações de wayfinding

O mapa possui um arquivo filho para cada ticket:

- **Mapa:** `.scratch/<effort>/map.md`, com `Notes`, `Decisions-so-far` e `Fog`.
- **Ticket filho:** `.scratch/<effort>/issues/NN-<slug>.md`, numerado a partir de `01`, com a pergunta no corpo. A linha `Type:` usa `research`, `prototype`, `grilling` ou `task`; a linha `Status:` usa `claimed` ou `resolved`.
- **Bloqueio:** a linha `Blocked by: NN, NN` fica próxima ao início. O ticket é desbloqueado quando todos os arquivos listados estão com `Status: resolved`.
- **Fronteira:** examine `.scratch/<effort>/issues/` e selecione o primeiro número entre os tickets abertos, desbloqueados e não reivindicados.
- **Reivindicação:** defina `Status: claimed` e salve antes de iniciar o trabalho.
- **Resolução:** acrescente a resposta sob `## Answer`, defina `Status: resolved` e adicione em `Decisions-so-far`, no `map.md`, um resumo com link para o contexto.
