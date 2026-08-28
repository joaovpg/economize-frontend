# Interface e estilos

Consulte este guia ao criar ou alterar componentes, ícones, tipografia e tokens visuais.

## Ícones

- Importe cada ícone Phosphor pelo caminho
  `@phosphor-icons/react/dist/csr/<IconName>`, nunca pelo entrypoint principal do pacote.
- Ao atualizar `@phosphor-icons/react`, confirme que os caminhos `dist/csr` usados pelo projeto
  continuam disponíveis.

Leia a decisão completa em
[ADR-0002](../adr/0002-phosphor-icons-import-performance.md).

## Tipografia

- Prefira os papéis tipográficos semânticos compartilhados: display, title, body, body-small,
  label, button e caption.
- Não crie tamanhos tipográficos fracionados locais quando um utilitário semântico atender ao
  contexto.
- Preserve a tipografia padrão da variante `link`; aplique ajustes contextuais no ponto de uso.

Leia a decisão completa em
[ADR-0005](../adr/0005-escala-tipografica-semantica-e-estilo-base-de-links.md).
