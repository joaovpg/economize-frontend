# Integração tipada por serviços e contrato HTTP compartilhado

**Status:** Aceito

As integrações HTTP existentes serão centralizadas em serviços por domínio, mantendo o cliente Ky como infraestrutura compartilhada e os loaders do TanStack Router como mecanismo de carregamento nesta etapa. Requests e responses serão validados por schemas Zod, com tipos inferidos; erros serão normalizados em `ApiError` a partir do Problem Details do backend, incluindo erros HTTP, de rede, timeout e contrato, enquanto cancelamentos permanecerão cancelamentos.

O escopo fica limitado às integrações já existentes de autenticação, contas e categorias; resumo e transações continuam demonstrativos. Os nomes das operações dos serviços seguirão o domínio e a rota HTTP para facilitar comparação com o Swagger, como `postLogin` e `getCategorias`, mesmo que isso seja menos abstrato que nomes puramente orientados a caso de uso. Não será introduzido TanStack Query nem geração OpenAPI nesta etapa.

Enquanto o resumo for demonstrativo, seus movimentos usam IDs demonstrativos estáveis e aparecem em grupos separados dos recursos reais carregados pela API. O filtro não compara nomes de movimentos demonstrativos com IDs ou nomes de contas e categorias persistidas.

Retries permanecerão conservadores para leituras e operações idempotentes, sem retry automático cego para `POST`. O cliente usará `credentials: "include"` para enviar cookies automaticamente, mas não tentará ler cookies no JavaScript nem inferir `X-CSRF-Token`. Antes de adicionar operações mutáveis, o backend e o frontend deverão definir um canal explícito para entrega do token CSRF; o escopo atual contém apenas login público e leituras.
