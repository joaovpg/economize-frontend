import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { getRouteApi } from "@tanstack/react-router";

import { AuthConsent } from "../../components/AuthConsent";
import { Button } from "../../components/Button";
import { Card, CardBody } from "../../components/Card";
import { TextField } from "../../components/TextField";
import { isApiError } from "../../lib/api-errors";
import { postLogin } from "../../services/auth/api";
import { loginRequestSchema, type LoginRequest } from "../../services/auth/contracts";

export const Route = createFileRoute("/_public/login")({
  component: LoginPage,
});

type LoginFormData = LoginRequest;

const loginRoute = getRouteApi("/_public/login");

function getFieldName(field: string | undefined): keyof LoginFormData | null {
  const name = field?.split("#").pop()?.split("/").pop();

  return name === "email" || name === "senha" ? name : null;
}

function LoginPage() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = loginRoute.useNavigate();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<LoginFormData>({
    mode: "onSubmit",
    resolver: zodResolver(loginRequestSchema),
  });
  const emailField = register("email");
  const senhaField = register("senha");

  const handleFormSubmit = async (data: LoginFormData) => {
    setSubmitError(null);

    try {
      await postLogin(data);
      await navigate({ replace: true, to: "/summary" });
    } catch (error) {
      if (!isApiError(error)) {
        setSubmitError("Não foi possível conectar ao servidor. Tente novamente.");
        return;
      }
      if (error.status === 401 || error.code === "CREDENCIAIS_INVALIDAS") {
        setSubmitError("E-mail ou senha inválidos.");
        return;
      }

      let hasFieldError = false;
      for (const [fieldName, messages] of Object.entries(error.fieldErrors)) {
        const field = getFieldName(fieldName);
        const message = messages[0];

        if (field && message) {
          setError(field, { type: "server", message });
          hasFieldError = true;
        }
      }

      if (!hasFieldError || error.problem?.detail) {
        setSubmitError(error.problem?.detail ?? "Não foi possível entrar. Tente novamente.");
      }
      return;
    }
  };

  return (
    <section
      className="grid min-h-107.5 grid-cols-[minmax(0,1fr)_22.5rem] items-end gap-26 max-[56.25rem]:min-h-0 max-[56.25rem]:grid-cols-1 max-[56.25rem]:gap-8.5"
      aria-labelledby="auth-title"
    >
      <div className="flex flex-col gap-5 pb-5.5 max-[56.25rem]:pb-0">
        <span
          className="block h-1 w-10 rounded-full bg-linear-to-r from-brand to-teal-200"
          aria-hidden="true"
        />
        <h1 className="m-0 max-w-[11ch] text-display-hero text-balance" id="auth-title">
          Vamos deixar isso simples.
        </h1>
        <p className="m-0 max-w-[35ch] text-body text-pretty text-muted">
          Entre para acompanhar sua vida financeira com clareza. Sem destaque chamativo, sem ruído,
          sem promessas exageradas.
        </p>
      </div>

      <Card as="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <CardBody className="gap-2">
          {submitError && (
            <p
              className="m-0 rounded-md bg-danger-soft px-3 py-2 text-validation text-danger"
              role="alert"
              aria-live="assertive"
            >
              {submitError}
            </p>
          )}
          <TextField
            label="E-mail"
            name={emailField.name}
            onBlur={emailField.onBlur}
            onInput={emailField.onChange}
            inputRef={emailField.ref}
            autoComplete="email"
            maxLength={320}
            placeholder="voce@exemplo.com"
            type="email"
            errorMessage={errors.email?.message}
          />
          <TextField
            label="Senha"
            name={senhaField.name}
            onBlur={senhaField.onBlur}
            onInput={senhaField.onChange}
            inputRef={senhaField.ref}
            type="password"
            autoComplete="current-password"
            maxLength={128}
            placeholder="Digite sua senha"
            errorMessage={errors.senha?.message}
          />
          <div className="flex justify-end">
            <Button className="font-bold" type="button" variant="link">
              Esqueci minha senha
            </Button>
          </div>

          <Button className="w-full" variant="primary" type="submit" isPending={isSubmitting}>
            Entrar
          </Button>
          <AuthConsent />
        </CardBody>
      </Card>
    </section>
  );
}
