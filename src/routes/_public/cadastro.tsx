import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { z } from "zod";

import { AuthConsent } from "../../components/AuthConsent";
import { Button } from "../../components/Button";
import { Card, CardBody } from "../../components/Card";
import { PasswordField } from "../../components/fields/PasswordField";
import { TextField } from "../../components/fields/TextField";
import { isApiError } from "../../lib/api-errors";
import { postCadastro, postLogin } from "../../services/auth/api";
import { cadastroRequestSchema } from "../../services/auth/contracts";
import { useTransactionFilterStore } from "../../stores/transaction-filters";

export const Route = createFileRoute("/_public/cadastro")({
  component: RegisterPage,
});

const cadastroSchema = cadastroRequestSchema
  .omit({ timezone: true })
  .extend({
    confirmacao: z.string(),
  })
  .refine((data) => data.senha === data.confirmacao, {
    message: "As senhas não coincidem.",
    path: ["confirmacao"],
  });

type RegisterFormData = z.infer<typeof cadastroSchema>;

const cadastroRoute = getRouteApi("/_public/cadastro");

function getFieldName(field: string | undefined): keyof RegisterFormData | null {
  const name = field?.split("#").pop()?.split("/").pop();

  return name === "nome" || name === "email" || name === "senha" ? name : null;
}

function RegisterPage() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = cadastroRoute.useNavigate();
  const timezone = new Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const {
    formState: { errors, isSubmitting },
    control,
    handleSubmit,
    setError,
  } = useForm<RegisterFormData>({
    defaultValues: { nome: "", email: "", senha: "", confirmacao: "" },
    mode: "onSubmit",
    resolver: zodResolver(cadastroSchema),
  });

  const handleFormSubmit = async (data: RegisterFormData) => {
    setSubmitError(null);

    try {
      await postCadastro({
        email: data.email,
        nome: data.nome,
        senha: data.senha,
        timezone,
      });

      await postLogin({
        email: data.email,
        senha: data.senha,
      });

      useTransactionFilterStore.getState().resetFilters();
      await navigate({ replace: true, to: "/summary" });
    } catch (error) {
      if (!isApiError(error)) {
        setSubmitError("Não foi possível conectar ao servidor. Tente novamente.");
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
        setSubmitError(
          error.problem?.detail ?? "Não foi possível criar sua conta. Tente novamente.",
        );
      }
    }
  };

  return (
    <section
      className="grid min-h-auth grid-cols-[minmax(0,1fr)_var(--spacing-auth-card)] items-start gap-24 max-lg:min-h-0 max-lg:grid-cols-1 max-lg:gap-8"
      aria-labelledby="auth-title"
    >
      <div className="flex flex-col gap-5 pt-6 pb-6 max-lg:pt-0 max-lg:pb-0">
        <h1 className="m-0 max-w-measure-heading text-title-page text-balance" id="auth-title">
          Crie sua conta.
        </h1>
        <p className="m-0 max-w-measure-lead text-body text-pretty text-muted">
          Cadastro direto, com campos fáceis de ler e sem elementos competindo com a tarefa
          principal.
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
            name="nome"
            render={({ field }) => (
              <TextField
                {...field}
                autoComplete="name"
                errorMessage={errors.nome?.message}
                isRequired
                label="Nome completo"
                maxLength={120}
                placeholder="Como você gosta de ser chamado?"
              />
            )}
          />
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
                autoComplete="new-password"
                description="Use entre 8 e 128 caracteres."
                errorMessage={errors.senha?.message}
                isRequired
                label="Senha"
                maxLength={128}
                placeholder="Crie uma senha segura"
              />
            )}
          />
          <Controller
            control={control}
            name="confirmacao"
            render={({ field }) => (
              <PasswordField
                {...field}
                autoComplete="new-password"
                errorMessage={errors.confirmacao?.message}
                isRequired
                label="Confirme sua senha"
                maxLength={128}
                placeholder="Repita sua senha"
              />
            )}
          />
          <p className="m-0 flex items-center gap-2 text-caption text-pretty text-muted before:size-2 before:flex-none before:shrink-0 before:rounded-full before:bg-muted before:content-['']">
            Fuso horário detectado: <strong>{timezone}</strong>
          </p>
          <Button
            className="w-full"
            variant="primary"
            type="submit"
            isPending={isSubmitting}
            trailingIcon={<ArrowRightIcon aria-hidden="true" weight="bold" />}
          >
            {isSubmitting ? "Enviando..." : "Criar minha conta"}
          </Button>
          <AuthConsent />
        </CardBody>
      </Card>
    </section>
  );
}
