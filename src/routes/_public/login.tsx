import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { getRouteApi } from "@tanstack/react-router";
import { isHTTPError } from "ky";
import { z } from "zod";

import { AuthConsent } from "../../components/AuthConsent";
import { Button } from "../../components/Button";
import { Card, CardBody } from "../../components/Card";
import { TextField } from "../../components/TextField";
import { api } from "../../lib/api";
import { emailSchema, passwordSchema } from "../../lib/auth";

export const Route = createFileRoute("/_public/login")({
  component: LoginPage,
});

const loginSchema = z.object({ email: emailSchema, senha: passwordSchema });

const problemDetailsSchema = z.object({
  detail: z.string().optional(),
  violations: z
    .array(
      z.object({
        field: z.string().optional(),
        message: z.string().optional(),
      }),
    )
    .optional(),
});

type LoginFormData = {
  email: string;
  senha: string;
};

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
    resolver: zodResolver(loginSchema),
  });
  const emailField = register("email");
  const senhaField = register("senha");

  const handleFormSubmit = async (data: LoginFormData) => {
    setSubmitError(null);

    try {
      await api.post("autenticacao/login", {
        json: { email: data.email, senha: data.senha },
      });
      await navigate({ replace: true, to: "/summary" });
    } catch (error) {
      if (!isHTTPError(error)) {
        setSubmitError("Não foi possível conectar ao servidor. Tente novamente.");
        return;
      }
      if (error.response.status === 401) {
        setSubmitError("E-mail ou senha inválidos.");
        return;
      }
      try {
        const problemResult = problemDetailsSchema.safeParse(await error.response.clone().json());
        if (!problemResult.success) {
          setSubmitError("Não foi possível entrar. Tente novamente.");
          return;
        }
        const problem = problemResult.data;
        let hasFieldError = false;
        for (const violation of problem.violations ?? []) {
          const field = getFieldName(violation.field);
          if (field && violation.message) {
            setError(field, { type: "server", message: violation.message });
            hasFieldError = true;
          }
        }
        if (!hasFieldError || problem.detail) {
          setSubmitError(problem.detail ?? "Não foi possível entrar. Tente novamente.");
        }
      } catch {
        setSubmitError("Não foi possível entrar. Tente novamente.");
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
