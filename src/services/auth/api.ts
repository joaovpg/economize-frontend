import { api } from "../../lib/api";
import { loginRequestSchema, type LoginRequest } from "./contracts";

export async function postLogin(input: LoginRequest): Promise<void> {
  const request = loginRequestSchema.parse(input);

  await api.post("autenticacao/login", {
    json: request,
    retry: { limit: 0 },
  });
}
