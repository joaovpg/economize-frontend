# ADR-0004: TanStack Router e code splitting automático por rota

## Status

Aceito

## Contexto

O bundle inicial importava todos os layouts e telas da aplicação, embora cada visita precise de
apenas um grupo de rotas. A aplicação tem um grupo de autenticação e outro de rotas privadas, e
ambos precisam de um estado de carregamento enquanto seus módulos são obtidos sob demanda.

## Decisão

Adotamos TanStack Router em substituição ao React Router, com rotas baseadas em arquivos, code splitting automático e preloading por intenção para reduzir o carregamento antecipado de telas. Os grupos público e privado compartilham a experiência de carregamento por seus layouts. A validação da sessão permanece sob responsabilidade da API, independente da organização visual.

As convenções de implementação ficam no [guia de arquitetura](../agent-guidelines/frontend-architecture.md).

## Consequências

- O splitting é automático por rota; os grupos organizam layouts e não exigem um único chunk por grupo. Layouts síncronos também podem ter seus componentes carregados sob demanda.
- O componente 404 é importado estaticamente pela raiz; esta decisão não prevê um chunk lazy específico para ele. A composição exata dos chunks deve ser verificada no build.
