import { isHTTPError, isNetworkError, isTimeoutError, type HTTPError } from "ky";
import { z } from "zod";

const apiFieldErrorSchema = z.looseObject({
  detail: z.string(),
  field: z.string(),
});

export const apiProblemSchema = z.looseObject({
  detail: z.string(),
  errors: z.array(apiFieldErrorSchema).optional(),
  instance: z.string(),
  status: z.number().int().min(100).max(599),
  title: z.string(),
  traceId: z.string(),
  type: z.string().regex(/^urn:economize:problem:.+$/),
});

export type ApiFieldError = z.infer<typeof apiFieldErrorSchema>;
export type ApiProblem = z.infer<typeof apiProblemSchema>;
export type ApiErrorKind = "contract" | "http" | "network" | "timeout";

type ApiErrorOptions = {
  cause?: unknown;
  kind: ApiErrorKind;
  message: string;
  problem?: ApiProblem;
  status?: number;
};

function getProblemCode(type: string | undefined) {
  const prefix = "urn:economize:problem:";

  return type?.startsWith(prefix) ? type.slice(prefix.length) : undefined;
}

function buildFieldErrors(errors: readonly ApiFieldError[]) {
  return errors.reduce<Record<string, string[]>>((fieldErrors, error) => {
    const messages = fieldErrors[error.field] ?? [];
    messages.push(error.detail);
    fieldErrors[error.field] = messages;

    return fieldErrors;
  }, {});
}

function getHttpErrorMessage(status: number, problem?: ApiProblem) {
  return problem?.detail ?? problem?.title ?? `A requisição falhou (HTTP ${status}).`;
}

export class ApiError extends Error {
  readonly code: string | undefined;
  readonly errors: readonly ApiFieldError[];
  readonly fieldErrors: Readonly<Record<string, readonly string[]>>;
  readonly kind: ApiErrorKind;
  readonly problem: ApiProblem | undefined;
  readonly status: number | undefined;
  readonly traceId: string | undefined;

  constructor({ cause, kind, message, problem, status }: ApiErrorOptions) {
    super(message, { cause });
    this.name = "ApiError";
    this.code = getProblemCode(problem?.type);
    this.errors = problem?.errors ?? [];
    this.fieldErrors = buildFieldErrors(this.errors);
    this.kind = kind;
    this.problem = problem;
    this.status = status;
    this.traceId = problem?.traceId;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export const guidedApiErrorCodes = [
  "OCORRENCIA_EFETIVADA_APOS_CORTE",
  "RECURSO_NAO_ENCONTRADO",
  "SEGMENTO_NAO_ATUAL",
  "VERSAO_DESATUALIZADA",
] as const;

export type GuidedApiErrorCode = (typeof guidedApiErrorCodes)[number];

const guidedApiErrorMessages: Record<GuidedApiErrorCode, string> = {
  OCORRENCIA_EFETIVADA_APOS_CORTE:
    "Há lançamentos efetivados a partir desta data. Edite somente esta ocorrência ou a partir da próxima não efetivada.",
  RECURSO_NAO_ENCONTRADO:
    "Este lançamento não existe mais ou foi alterado. Feche e consulte novamente.",
  SEGMENTO_NAO_ATUAL:
    "Esta série já foi alterada a partir de uma data posterior. Edite a partir de uma ocorrência mais recente.",
  VERSAO_DESATUALIZADA:
    "Este lançamento foi alterado em outro lugar. Feche e abra novamente para ver a versão atual.",
};

function isGuidedApiErrorCode(code: string): code is GuidedApiErrorCode {
  return (guidedApiErrorCodes as readonly string[]).includes(code);
}

/**
 * Mensagem orientativa para os erros de edição e exclusão de lançamentos (Conflito de versão,
 * lançamento inexistente e regras de série). Retorna undefined para os demais erros.
 */
export function getGuidedApiErrorMessage(error: unknown): string | undefined {
  if (!isApiError(error) || error.code === undefined || !isGuidedApiErrorCode(error.code)) {
    return undefined;
  }

  return guidedApiErrorMessages[error.code];
}

export function createContractApiError(cause: unknown) {
  return new ApiError({
    cause,
    kind: "contract",
    message: "O servidor enviou uma resposta inesperada.",
  });
}

function createHttpApiError(error: HTTPError) {
  const problemResult = apiProblemSchema.safeParse(error.data);
  const problem = problemResult.success ? problemResult.data : undefined;

  return new ApiError({
    cause: error,
    kind: "http",
    message: getHttpErrorMessage(error.response.status, problem),
    problem,
    status: error.response.status,
  });
}

export function normalizeKyError(error: unknown): Error {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error && error.name === "AbortError") {
    return error;
  }

  if (isHTTPError(error)) {
    return createHttpApiError(error);
  }

  if (isNetworkError(error)) {
    return new ApiError({
      cause: error,
      kind: "network",
      message: "Não foi possível conectar ao servidor.",
    });
  }

  if (isTimeoutError(error)) {
    return new ApiError({
      cause: error,
      kind: "timeout",
      message: "O servidor demorou para responder.",
    });
  }

  return error instanceof Error ? error : new Error("Ocorreu um erro inesperado.");
}
