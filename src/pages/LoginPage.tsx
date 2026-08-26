import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { isHTTPError } from "ky";
import { z } from "zod";

import { Button } from "../components/Button";
import { Link } from "../components/Link";
import { TextField } from "../components/TextField";
import { api } from "../lib/api";

const emailSchema = z
  .email("Digite um e-mail válido.")
  .min(1, "Digite seu e-mail.")
  .max(320, "Use até 320 caracteres.");

const passwordSchema = z
  .string()
  .min(1, "Digite sua senha.")
  .refine((value) => value.trim().length > 0, "Digite sua senha.");

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

function getFieldName(field: string | undefined): keyof LoginFormData | null {
  const name = field?.split("#").pop()?.split("/").pop();

  return name === "email" || name === "senha" ? name : null;
}

function SuccessIcon() {
  return (
    <span
      className="grid size-7 place-items-center rounded-full bg-[color-mix(in_oklch,var(--color-success)_15%,transparent)] text-success"
      aria-hidden="true"
    >
      <CheckCircleIcon size={20} />
    </span>
  );
}

function LoginPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();
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
      await navigate("/dashboard", { replace: true });
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
    setSubmitted(true);
  };

  return (
    <section className="auth-grid" aria-labelledby="auth-title">
      <div className="auth-copy flex flex-col gap-5">
        <span className="auth-accent" aria-hidden="true" />
        <h1 className="m-0 max-w-[11ch] text-display-hero text-balance" id="auth-title">
          Vamos deixar isso simples.
        </h1>
        <p className="m-0 max-w-[35ch] text-body text-pretty text-muted">
          Entre para acompanhar sua vida financeira com clareza. Sem destaque chamativo, sem ruído,
          sem promessas exageradas.
        </p>
      </div>

      <div>
        {submitted ? (
          <output className="auth-success-card" aria-live="polite">
            <SuccessIcon />
            <div className="flex flex-col gap-1.5">
              <h2 className="m-0 text-title-compact text-foreground">
                Login recebido.
              </h2>
              <p className="m-0 text-caption text-muted">
                O servidor respondeu à tentativa de login.
              </p>
            </div>
            <Button
              type="button"
              className="col-start-2 justify-self-start"
              variant="link"
              onPress={() => setSubmitted(false)}
            >
              Voltar ao formulário
            </Button>
          </output>
        ) : (
          <form className="auth-form-card" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
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
              <Link className="font-bold" variant="link">
                Esqueci minha senha
              </Link>
            </div>
            {submitError && (
              <p
                className="m-0 rounded-md bg-danger-soft px-3 py-2 text-validation text-danger"
                role="alert"
                aria-live="assertive"
              >
                {submitError}
              </p>
            )}
            <Button
              className="w-full"
              variant="primary"
              type="submit"
              isPending={isSubmitting}
              trailingIcon={<ArrowRightIcon aria-hidden="true" weight="bold" />}
            >
              {isSubmitting ? "Enviando..." : "Entrar"}
            </Button>
            <p className="m-0 text-center text-caption text-subtle">
              Ao continuar, você concorda com uma experiência de controle financeiro mais
              consciente.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

export default LoginPage;
