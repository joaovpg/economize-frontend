import { api, parseApiResponse } from "../../lib/api";
import { saveCsrfToken } from "../../lib/csrf";
import { csrfTokenResponseSchema, loginRequestSchema, type LoginRequest } from "./contracts";

export async function postLogin(input: LoginRequest): Promise<void> {
  const request = loginRequestSchema.parse(input);

  const response = api.post("autenticacao/login", {
    json: request,
    retry: { limit: 0 },
  });

  const { csrfToken } = await parseApiResponse(response, csrfTokenResponseSchema);
  saveCsrfToken(csrfToken);
}
