# 09: Limite de 80 caracteres no nome da categoria

**O que construir:** Alinhar a validação do nome da categoria ao contrato (`maxLength: 80`).

**Bloqueada por:** nenhuma.

**Status:** done

**Estado observado no código:** `categoriaNomeSchema` em `services/categories/contracts.ts` não tem limite. O formulário em `category-form.ts` precisa ser conferido.

**Critérios de aceite:**

- [x] O contrato e o formulário limitam o nome a 80 caracteres, com a mensagem "Use até 80 caracteres."
- [x] `pnpm check` passa.

**Como verificar:** tentar salvar uma categoria com 81 caracteres.
