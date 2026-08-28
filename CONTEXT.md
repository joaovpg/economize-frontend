# Contexto do Domínio

## Autenticação

- **Pessoa não autenticada**: visitante sem uma sessão válida reconhecida pelo servidor.
- **Pessoa autenticada**: visitante associado a uma sessão válida reconhecida pelo servidor, com
  acesso às rotas privadas.
- **Sessão**: vínculo de autenticação gerenciado pelo servidor. A validade da sessão é confirmada
  pelas respostas da API; quando ela deixa de ser válida, operações privadas são recusadas e a
  pessoa é direcionada ao login.

## Navegação

- **Rota pública**: rota explicitamente configurada para poder ser acessada sem sessão, como `/login` e `/cadastro`.
- **Rota privada**: qualquer rota que não esteja declarada como pública; exige uma sessão autenticada.
