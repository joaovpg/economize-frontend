# Interface e estilos

## Estilos

- Use Tailwind Variants para criar variantes em componentes.
- Objetos de classes estáticas podem continuar como objetos; não precisam de `tv`.
- Prefira as cores semânticas de `src/styles/tokens/` e preserve os temas claro e escuro.

## Componentes e formulários

- Reutilize os componentes de `src/components/` antes de criar novos controles.
- Para novos controles interativos, prefira React Aria quando aplicável. Preserve navegação por
  teclado, nomes acessíveis e indicação de foco ao personalizar os estilos.
- Prefira React Hook Form com Zod e `zodResolver` em formulários que precisam de gerenciamento
  de estado e validação. Exiba os erros junto aos campos correspondentes.
- Ao adicionar animações, respeite a preferência de movimento reduzido.

## Ícones

Ao importar ícones ou atualizar o Phosphor, siga o padrão e a verificação de compatibilidade do
[ADR-0002](../adr/0002-phosphor-icons-import-performance.md).

## Tipografia

- Prefira os papéis tipográficos do
  [catálogo de utilitários](../../src/styles/tokens/utilities/typography.css) antes de criar tamanhos
  locais. O catálogo define os nomes e as medidas disponíveis.
- Preserve a tipografia padrão da variante `link`; aplique ajustes contextuais no ponto de uso.

Para a motivação e o impacto do contrato tipográfico compartilhado, consulte
[ADR-0005](../adr/0005-escala-tipografica-semantica-e-estilo-base-de-links.md).
