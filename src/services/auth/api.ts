import { api, parseApiResponse } from "../../lib/api";
import { saveCsrfToken } from "../../lib/csrf";
import {
  cadastroRequestSchema,
  csrfTokenResponseSchema,
  loginRequestSchema,
  usuarioResponseSchema,
  type CadastroRequest,
  type LoginRequest,
  type UsuarioResponse,
} from "./contracts";

export async function postCadastro(input: CadastroRequest): Promise<UsuarioResponse> {
  const request = cadastroRequestSchema.parse(input);

  return parseApiResponse(
    api.post("autenticacao/cadastro", {
      json: request,
      retry: { limit: 0 },
    }),
    usuarioResponseSchema,
  );
}

export async function postLogin(input: LoginRequest): Promise<void> {
  const request = loginRequestSchema.parse(input);

  const response = api.post("autenticacao/login", {
    json: request,
    retry: { limit: 0 },
  });

  const { csrfToken } = await parseApiResponse(response, csrfTokenResponseSchema);
  saveCsrfToken(csrfToken);
}
