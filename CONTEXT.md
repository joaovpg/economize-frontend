# Contexto do Domínio

## Autenticação

- **Pessoa não autenticada**: visitante sem uma sessão válida no frontend.
- **Pessoa autenticada**: visitante associado a uma sessão válida, com acesso às rotas privadas.
- **Sessão**: estado que informa se a pessoa está carregando, não autenticada ou autenticada.

## Navegação

- **Rota pública**: rota explicitamente configurada para poder ser acessada sem sessão, como `/login` e `/cadastro`.
- **Rota privada**: qualquer rota que não esteja declarada como pública; exige uma sessão autenticada.
