import ky, {
  SchemaValidationError,
  type ResponsePromise,
  type StandardSchemaV1,
  type StandardSchemaV1InferOutput,
} from "ky";

import { createContractApiError, normalizeKyError } from "./api-errors";
import { clearCsrfToken, getCsrfToken } from "./csrf";

const UNAUTHORIZED = 401;
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const PUBLIC_AUTHENTICATION_ENDPOINTS = [
  "/autenticacao/cadastro",
  "/autenticacao/login",
  "/autenticacao/logout",
] as const;

const PUBLIC_ROUTES = new Set(["/login", "/cadastro"]);

export type ApiRequestOptions = {
  signal?: AbortSignal;
};

function isPublicAuthenticationRequest(request: Request): boolean {
  const { pathname } = new URL(request.url);

  return PUBLIC_AUTHENTICATION_ENDPOINTS.some((endpoint) => pathname.endsWith(endpoint));
}

export const api = ky.create({
  prefix: import.meta.env.VITE_API_URL,
  credentials: "include",
  retry: {
    methods: ["get", "head", "options", "trace", "put", "delete"],
  },
  hooks: {
    beforeRequest: [
      ({ request }) => {
        if (!MUTATING_METHODS.has(request.method) || isPublicAuthenticationRequest(request)) {
          return;
        }

        const csrfToken = getCsrfToken();
        if (csrfToken) {
          request.headers.set("X-CSRF-Token", csrfToken);
        }
      },
    ],
    afterResponse: [
      async ({ response }) => {
        if (response.status !== UNAUTHORIZED) {
          return;
        }

        clearCsrfToken();

        if (typeof window !== "undefined" && !PUBLIC_ROUTES.has(window.location.pathname)) {
          window.location.replace("/login");
        }
      },
    ],
    beforeError: [({ error }) => normalizeKyError(error)],
  },
});

export async function parseApiResponse<Schema extends StandardSchemaV1>(
  response: ResponsePromise,
  schema: Schema,
): Promise<StandardSchemaV1InferOutput<Schema>> {
  try {
    return await response.json(schema);
  } catch (error) {
    if (error instanceof SchemaValidationError || error instanceof SyntaxError) {
      throw createContractApiError(error);
    }

    throw error;
  }
}
