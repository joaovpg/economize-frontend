# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pessoas que buscam organizar a própria vida financeira, acompanhar seus gastos e tomar decisões com uma visão mais clara do uso do dinheiro.

## Product Purpose

O Economize existe para dar às pessoas uma visão clara dos próprios gastos financeiros. O produto deve apoiar a organização da vida financeira, a geração de relatórios, o controle de orçamentos e o entendimento da distribuição das despesas.

## Positioning

Uma ferramenta de visão financeira pessoal orientada à clareza dos gastos, sem ruído ou promessas exageradas. Seu valor está em ajudar a pessoa a entender como o dinheiro está sendo distribuído e manter esse entendimento sob seu controle.

## Operating Context

O produto é usado como uma aplicação web para registrar e consultar movimentações financeiras, organizar contas e categorias, acompanhar períodos e interpretar a distribuição dos gastos. Relatórios e orçamentos fazem parte do objetivo do produto e devem ser tratados como necessidades reais do usuário à medida que forem implementados.

## Capabilities and Constraints

- Os dados exibidos devem ser sempre reais e carregados pela API do Economize; não criar dados demonstrativos para representar dados financeiros do usuário.
- O frontend existente oferece autenticação, consulta e gerenciamento de contas, categorias e transações, além de uma área de resumo.
- Relatórios, controle de orçamentos e visões de distribuição de gastos são objetivos confirmados do produto; a cobertura atual de cada recurso deve ser verificada antes de tratá-la como implementada.
- A experiência deve ser apresentada em português brasileiro.
- Privacidade dos dados financeiros é uma restrição permanente.

## Brand Commitments

- Preservar o nome Economize e a identidade visual existente do projeto.
- Manter uma comunicação clara, sóbria e sem promessas exageradas.

## Evidence on Hand

- O repositório contém o frontend React do Economize e seus tokens visuais em `src/styles/tokens/`.
- O frontend integra-se à API do Economize por meio de serviços tipados em `src/services/`.
- O repositório contém telas e fluxos de autenticação, contas, categorias, transações e resumo.
- Não há depoimentos, benchmarks, provas comerciais ou outros ativos de validação fornecidos no repositório; trabalhos futuros não devem inventá-los.

## Product Principles

- Dar visibilidade compreensível à distribuição dos gastos.
- Trabalhar com dados reais para sustentar decisões financeiras confiáveis.
- Ajudar a pessoa a organizar e controlar sua vida financeira sem adicionar ruído.
- Tratar privacidade e acessibilidade como requisitos do produto.
- Preservar a identidade do Economize e a linguagem em português brasileiro.

## Accessibility & Inclusion

Acessibilidade é um requisito permanente do produto. Interfaces, formulários, navegação, mensagens de estado e relatórios devem permanecer utilizáveis por pessoas com diferentes necessidades de interação e percepção.
