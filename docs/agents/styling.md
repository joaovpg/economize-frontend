# Estilos e design system

## Tailwind CSS

- O projeto usa Tailwind CSS 4 no modelo CSS-first. Preserve o plugin `@tailwindcss/vite`, o `@import "tailwindcss"` em `src/styles/index.css` e a configuração existente; não introduza a configuração ou as diretivas do Tailwind 3.
- Prefira utilitários Tailwind completos diretamente no `className` para composições locais e estáticas.
- Use classes completas e detectáveis no código. Não monte fragmentos dinâmicos como `text-${color}-500`; use um mapa explícito de classes ou uma receita `tv`.
- Use valores arbitrários (`[...]`) apenas quando um utilitário ou token não resolver o caso. Se o valor se repetir ou representar uma decisão do design system, transforme-o em token.
- Não crie classes CSS próprias para agrupar utilitários já disponíveis, nem para layout, espaçamento, tipografia, cores, estados ou aparência de componentes.
- Não crie novos arquivos CSS para componentes. Mantenha os arquivos de tokens em `src/styles/tokens/**` e adicione novos tokens somente ao arquivo apropriado dessa estrutura.
- `src/styles/index.css` é o ponto de entrada global do Tailwind e dos tokens; não o use para acumular estilos de componentes.
- `src/styles/private.css` é legado congelado: não adicione novas classes ou regras nele. A migração ou remoção desse arquivo pertence a uma tarefa separada.
- CSS customizado só é aceitável para base/reset, token, tema, utilitário realmente novo, integração com terceiro, pseudo-elemento, seletor relacional ou comportamento estrutural que utilitários não expressem bem. Mantenha essas exceções pequenas e justificadas.
- Não use `style={{ ... }}` para estilo estático. Valores visuais realmente dinâmicos vindos de dados podem usar uma variável CSS controlada pelo componente quando não houver uma classe completa viável.

## `tailwind-variants`

- Use `tv` para componentes reutilizáveis com variantes, tamanhos, estados, slots ou combinações condicionais.
- Use `className` simples para elementos pontuais e estáticos sem uma matriz de variantes.
- Derive os tipos públicos com `VariantProps<typeof receita>`; não repita manualmente os tipos das variantes.
- Use `slots`, `compoundVariants` e `extend` somente quando a estrutura do componente exigir.
- Não espalhe variantes por concatenações manuais de strings nem use `className` para esconder uma variante recorrente que deveria estar modelada na receita.
