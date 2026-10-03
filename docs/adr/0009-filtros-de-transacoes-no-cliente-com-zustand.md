# Filtros de transações no cliente com Zustand

**Status:** Aceito

Esta decisão substitui a política de estado dos filtros de transações descrita na ADR-0008. A tela de resumo mantém seu estado atual nos search params.

## Contexto

A tela de transações oferece filtros de conta, categoria, texto e inclusão do saldo anterior. O mês selecionado determina o período da consulta ao backend. O saldo de abertura retornado pela API é um valor agregado e não pode ser dividido por conta ou categoria quando esse recorte é aplicado somente no cliente.

## Decisão

- Os filtros de conta, categoria, texto e inclusão do saldo anterior da tela de transações serão mantidos em um store Zustand com persistência em `localStorage`. O store não será compartilhado com a tela de resumo.
- Um login bem-sucedido limpa o store para os padrões: todas as contas, nenhuma categoria, busca vazia e inclusão do saldo anterior. O mesmo reset ocorre no cadastro, que faz login automaticamente. O mês permanece nos search params e, ao entrar sem mês explícito, usa o mês atual.
- A tela buscará todas as transações do mês sem enviar filtros de conta ou categoria. Contas, categorias e busca por texto serão aplicadas localmente. Seleções de conta, categoria e saldo anterior atualizam imediatamente; a busca por texto usa debounce de 300 ms.
- Os indicadores e acumulados diários serão calculados com os itens visíveis. Quando houver recorte por conta, categoria ou texto, o cenário começará em zero e será apresentado como projeção do recorte. O saldo de abertura agregado não será atribuído ao recorte, e o controle “Incluir saldo anterior” ficará indisponível.
- Sem recorte por conta, categoria ou texto, a tela usará `saldoAbertura` como base somente quando “Incluir saldo anterior” estiver ativo. Desativado, o cálculo começa em zero.

## Consequências

- Alterar contas, categorias ou texto não refaz a consulta do mês nem muda a URL. A seleção continua após recarregar a página e é limpa no próximo login.
- O cache de transações depende do período; os recortes de conta, categoria e texto são calculados a partir dos itens mensais em memória.
- Uma projeção filtrada descreve o movimento selecionado a partir de zero; não representa o saldo bancário real de uma conta ou categoria.
- Os filtros da tela de resumo continuam independentes, conforme a ADR-0008.
