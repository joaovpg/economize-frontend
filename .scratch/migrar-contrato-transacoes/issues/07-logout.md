# 07: Logout

**O que construir:** Botão Sair no header do layout privado.

**Bloqueada por:** nenhuma.

**Status:** done

**Estado observado no código:** `src/routes/_private/route.tsx` tem um header só com o logo. `POST /autenticacao/logout` existe e não é usado; o endpoint aparece apenas na allowlist de CSRF de `lib/api.ts`.

**Critérios de aceite:**

- [x] O botão Sair (ghost, com ícone e rótulo acessível) fica no lado direito do header.
- [x] O clique chama `POST /autenticacao/logout`, limpa o token CSRF e o cache do TanStack Query e navega para `/login`.
- [x] A limpeza local e o redirecionamento acontecem mesmo se a chamada falhar.
- [x] `pnpm check` passa.

**Como verificar:** entrar, clicar em Sair, tentar acessar `/transactions` e ser redirecionado para `/login`.
