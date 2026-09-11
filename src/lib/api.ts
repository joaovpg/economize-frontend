import ky, {
  SchemaValidationError,
  type ResponsePromise,
  type StandardSchemaV1,
  type StandardSchemaV1InferOutput,
} from "ky";

import { createContractApiError, normalizeKyError } from "./api-errors";

const UNAUTHORIZED = 401;

const PUBLIC_ROUTES = new Set(["/login", "/cadastro"]);

export type ApiRequestOptions = {
  signal?: AbortSignal;
};

export const api = ky.create({
  prefix: import.meta.env.VITE_API_URL,
  credentials: "include",
  retry: {
    methods: ["get", "head", "options", "trace", "put", "delete"],
  },
  hooks: {
    afterResponse: [
      async ({ response }) => {
        if (
          response.status === UNAUTHORIZED &&
          typeof window !== "undefined" &&
          !PUBLIC_ROUTES.has(window.location.pathname)
        ) {
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
