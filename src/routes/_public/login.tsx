import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { getRouteApi } from "@tanstack/react-router";

import { AuthConsent } from "../../components/AuthConsent";
import { Button } from "../../components/Button";
import { Card, CardBody } from "../../components/Card";
import { PasswordField } from "../../components/fields/PasswordField";
import { TextField } from "../../components/fields/TextField";
import { isApiError } from "../../lib/api-errors";
import { postLogin } from "../../services/auth/api";
import { loginRequestSchema, type LoginRequest } from "../../services/auth/contracts";
import { useTransactionFilterStore } from "../../stores/transaction-filters";

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
    control,
    handleSubmit,
    setError,
  } = useForm<LoginFormData>({
    defaultValues: { email: "", senha: "" },
    mode: "onSubmit",
    resolver: zodResolver(loginRequestSchema),
  });

  const handleFormSubmit = async (data: LoginFormData) => {
    setSubmitError(null);

    try {
      await postLogin(data);
      useTransactionFilterStore.getState().resetFilters();
      await navigate({ replace: true, to: "/transactions" });
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
          setError(field, { message, type: "server" });
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
      className="grid min-h-auth grid-cols-[minmax(0,1fr)_var(--spacing-auth-card)] items-end gap-24 max-lg:min-h-0 max-lg:grid-cols-1 max-lg:gap-8"
      aria-labelledby="auth-title"
    >
      <div className="flex flex-col gap-5 pb-6 max-lg:pb-0">
        <h1 className="m-0 max-w-measure-heading text-title-page text-balance" id="auth-title">
          Vamos deixar isso simples.
        </h1>
        <p className="m-0 max-w-measure-lead text-body text-pretty text-muted">
          Entre para acompanhar sua vida financeira com clareza. Sem destaque chamativo, sem ruído,
          sem promessas exageradas.
        </p>
      </div>

      <Card as="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <CardBody spacing="compact">
          {submitError && (
            <p
              className="m-0 rounded-control bg-danger-soft px-3 py-2 text-caption text-danger"
              role="alert"
              aria-live="assertive"
            >
              {submitError}
            </p>
          )}
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <TextField
                {...field}
                autoComplete="email"
                errorMessage={errors.email?.message}
                isRequired
                label="E-mail"
                maxLength={320}
                placeholder="voce@exemplo.com"
                type="email"
              />
            )}
          />
          <Controller
            control={control}
            name="senha"
            render={({ field }) => (
              <PasswordField
                {...field}
                autoComplete="current-password"
                errorMessage={errors.senha?.message}
                isRequired
                label="Senha"
                maxLength={128}
                placeholder="Digite sua senha"
              />
            )}
          />
          <div className="flex justify-end">
            <Button type="button" variant="link">
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
