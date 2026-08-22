import { useEffect, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/csr/EyeSlash";
import { TrendUpIcon } from "@phosphor-icons/react/dist/csr/TrendUp";
import { isHTTPError } from "ky";
import { useForm, type UseFormRegister } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { api } from "../lib/api";

type AuthMode = "login" | "cadastro";

const emailSchema = z
  .email("Digite um e-mail válido.")
  .min(1, "Digite seu e-mail.")
  .max(320, "Use até 320 caracteres.");

const passwordSchema = z
  .string()
  .min(1, "Digite sua senha.")
  .refine((value) => value.trim().length > 0, "Digite sua senha.");

const loginSchema = z.object({ email: emailSchema, senha: passwordSchema });

const cadastroSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(1, "Digite seu nome.")
      .max(120, "Use até 120 caracteres."),
    email: emailSchema,
    senha: passwordSchema
      .min(8, "A senha deve ter entre 8 e 128 caracteres.")
      .max(128, "A senha deve ter entre 8 e 128 caracteres."),
    confirmacao: z.string(),
  })
  .refine((data) => data.senha === data.confirmacao, {
    path: ["confirmacao"],
    message: "As senhas não coincidem.",
  });

type AuthFormData = {
  nome?: string;
  email: string;
  senha: string;
  confirmacao?: string;
};

type ProblemDetails = {
  detail?: string;
  violations?: Array<{ field?: string; message?: string }>;
};

function getFieldName(field: string | undefined): keyof AuthFormData | null {
  const name = field?.split("#").pop()?.split("/").pop();

  return name === "nome" ||
    name === "email" ||
    name === "senha" ||
    name === "confirmacao"
    ? name
    : null;
}

function LogoMark() {
  return (
    <span
      className="grid size-7.25 place-items-center rounded-[0.5625rem] bg-brand text-brand-foreground"
      aria-hidden="true"
    >
      <TrendUpIcon size={19} weight="bold" />
    </span>
  );
}

function ArrowIcon() {
  return <ArrowRightIcon aria-hidden="true" size={16} weight="bold" />;
}

function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <EyeIcon aria-hidden="true" size={19} />
  ) : (
    <EyeSlashIcon aria-hidden="true" size={19} />
  );
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

function AuthPage({ mode }: { mode: AuthMode }) {
  const isLogin = mode === "login";
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [timezone, setTimezone] = useState("detectando...");
  const navigate = useNavigate();
  const schema = isLogin ? loginSchema : cadastroSchema;
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<AuthFormData>({
    mode: "onSubmit",
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    try {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    } catch {
      setTimezone("UTC");
    }
  }, []);

  const handleModeChange = (nextMode: AuthMode) => {
    setSubmitted(false);
    setSubmitError(null);
    navigate(nextMode === "login" ? "/login" : "/cadastro");
  };

  const handleFormSubmit = async (data: AuthFormData) => {
    setSubmitError(null);

    if (isLogin) {
      try {
        await api.post("autenticacao/login", {
          json: { email: data.email, senha: data.senha },
        });
        navigate("/dashboard", { replace: true });
      } catch (error) {
        if (!isHTTPError(error)) {
          setSubmitError(
            "Não foi possível conectar ao servidor. Tente novamente.",
          );
          return;
        }
        if (error.response.status === 401) {
          setSubmitError("E-mail ou senha inválidos.");
          return;
        }
        try {
          const problem = (await error.response
            .clone()
            .json()) as ProblemDetails;
          let hasFieldError = false;
          for (const violation of problem.violations ?? []) {
            const field = getFieldName(violation.field);
            if (field && violation.message) {
              setError(field, { type: "server", message: violation.message });
              hasFieldError = true;
            }
          }
          if (!hasFieldError || problem.detail) {
            setSubmitError(
              problem.detail ?? "Não foi possível entrar. Tente novamente.",
            );
          }
        } catch {
          setSubmitError("Não foi possível entrar. Tente novamente.");
        }
        return;
      }
    }
    setSubmitted(true);
  };

  const title = isLogin
    ? "Bom te ver por aqui."
    : "Comece a organizar sua vida financeira.";
  const description = isLogin
    ? "Entre para continuar acompanhando suas escolhas."
    : "Um espaço simples para registrar o que importa e gastar com mais clareza.";

  return (
    <main className="grid min-h-svh place-items-start bg-canvas px-5 py-6 sm:place-items-center sm:px-8 sm:py-10 lg:px-12 lg:py-14">
      <section
        className={`w-full ${isLogin ? "max-w-104" : "max-w-136"}`}
        aria-labelledby="auth-title"
      >
        <header
          className={`flex items-start gap-8 ${isLogin ? "justify-center sm:justify-between" : "justify-between"}`}
        >
          <Link
            className="inline-flex items-center gap-2 rounded-md text-md font-bold tracking-[-0.03em] text-foreground no-underline outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
            to="/login"
            aria-label="Economize, ir para login"
          >
            <LogoMark />
            <span>economize</span>
          </Link>
          <div
            className={`flex max-w-36 flex-col items-end gap-1.5 pt-1 text-right text-[0.84rem] leading-normal text-muted sm:max-w-40 ${isLogin ? "hidden sm:flex" : ""}`}
          >
            <span>
              {isLogin ? "Ainda não tem uma conta?" : "Já tem uma conta?"}
            </span>
            <button
              className="cursor-pointer rounded-sm border-0 bg-transparent p-0 font-inherit font-bold text-brand outline-none hover:text-brand-hover hover:underline hover:underline-offset-3 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              type="button"
              onClick={() => handleModeChange(isLogin ? "cadastro" : "login")}
            >
              {isLogin ? "Criar conta" : "Entrar"}
            </button>
          </div>
        </header>

        <div
          className={`w-full ${isLogin ? "mt-16 sm:mt-20" : "mt-14 sm:mt-20 lg:mt-24"}`}
        >
          <h1
            className={`m-0 font-semibold leading-[1.2] text-foreground ${isLogin ? "max-w-none text-center font-ui text-[1.65rem] tracking-[-0.03em] sm:text-[1.85rem]" : "max-w-[15ch] font-serif text-[2.15rem] tracking-[-0.04em] sm:text-[2.7rem]"}`}
            id="auth-title"
          >
            {title}
          </h1>
          <p
            className={`mt-3 max-w-[42ch] text-[0.9rem] leading-[1.6] text-muted ${isLogin ? "mx-auto max-w-[31ch] text-center" : ""}`}
          >
            {description}
          </p>

          {submitted ? (
            <div
              className="mt-10 grid grid-cols-[auto_1fr] gap-3.5 rounded-xl border border-success bg-success-soft p-4.5 shadow-[0_10px_30px_color-mix(in_oklch,var(--color-success)_8%,transparent)]"
              role="status"
              aria-live="polite"
            >
              <SuccessIcon />
              <div>
                <h2 className="m-0 mt-0.5 mb-1.5 text-[0.95rem] text-foreground">
                  {isLogin ? "Login recebido." : "Cadastro validado."}
                </h2>
                <p className="m-0 text-[0.8rem] leading-normal text-muted">
                  {isLogin
                    ? "O servidor respondeu à tentativa de login."
                    : "Esta é uma demonstração local. Nenhum dado foi enviado ao servidor."}
                </p>
              </div>
              <button
                type="button"
                className="col-start-2 justify-self-start rounded-sm border-0 bg-transparent p-0 text-[0.78rem] font-inherit font-bold text-brand outline-none hover:text-brand-hover hover:underline hover:underline-offset-3 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-success-soft"
                onClick={() => setSubmitted(false)}
              >
                Voltar ao formulário
              </button>
            </div>
          ) : (
            <form
              className={`mt-8 grid ${isLogin ? "gap-4" : "gap-4.5"}`}
              onSubmit={handleSubmit(handleFormSubmit)}
              noValidate
            >
              {!isLogin && (
                <Field
                  register={register}
                  name="nome"
                  label="Nome completo"
                  placeholder="Como você gosta de ser chamado?"
                  autoComplete="name"
                  error={errors.nome?.message}
                />
              )}
              <Field
                register={register}
                name="email"
                label="E-mail"
                placeholder="voce@exemplo.com"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
              />
              <Field
                register={register}
                name="senha"
                label="Senha"
                placeholder={
                  isLogin ? "Digite sua senha" : "Crie uma senha segura"
                }
                type={showPassword ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                error={errors.senha?.message}
                suffix={
                  <button
                    type="button"
                    className="grid size-11 shrink-0 place-items-center rounded-[0.625rem] border-0 bg-transparent p-0 text-subtle outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <PasswordVisibilityIcon visible={showPassword} />
                  </button>
                }
              />
              {!isLogin && (
                <Field
                  register={register}
                  name="confirmacao"
                  label="Confirme sua senha"
                  placeholder="Repita sua senha"
                  type="password"
                  autoComplete="new-password"
                  error={errors.confirmacao?.message}
                />
              )}
              {!isLogin && (
                <div className="-mt-0.5 flex items-center gap-2.5 text-[0.78rem] text-muted">
                  <span
                    className="size-1.75 shrink-0 rounded-full bg-brand"
                    aria-hidden="true"
                  />
                  <span>
                    Fuso horário detectado: <strong>{timezone}</strong>
                  </span>
                </div>
              )}
              {isLogin && (
                <div className="-mt-1 flex justify-end text-[0.8rem]">
                  <Link
                    className="rounded-sm font-bold text-brand no-underline outline-none hover:text-brand-hover hover:underline hover:underline-offset-3 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                    to="#"
                    onClick={(event) => event.preventDefault()}
                  >
                    Esqueci minha senha
                  </Link>
                </div>
              )}
              {submitError && (
                <p
                  className="m-0 rounded-md bg-danger-soft px-3 py-2 text-[0.78rem] leading-normal text-danger"
                  role="alert"
                  aria-live="assertive"
                >
                  {submitError}
                </p>
              )}
              <button
                className="mt-1 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-md border-0 bg-brand px-4 py-3 font-inherit text-[0.88rem] font-bold text-brand-foreground outline-none transition hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:opacity-90 disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none"
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting
                  ? "Enviando..."
                  : isLogin
                    ? "Entrar"
                    : "Criar minha conta"}
                <ArrowIcon />
              </button>
              <p className="m-[0.0625rem_0_0] text-center text-[0.72rem] leading-normal text-subtle">
                Ao continuar, você concorda com uma experiência de controle
                financeiro mais consciente.
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function Field({
  register,
  name,
  label,
  placeholder,
  type = "text",
  autoComplete,
  error,
  suffix,
}: {
  register: UseFormRegister<AuthFormData>;
  name: keyof AuthFormData;
  label: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  error?: string;
  suffix?: ReactNode;
}) {
  const errorId = `${name}-error`;

  return (
    <div className="grid gap-2">
      <label
        className="text-[0.84rem] font-semibold text-foreground"
        htmlFor={name}
      >
        {label}
      </label>
      <div
        className={`flex min-h-11 items-center rounded-md border bg-surface transition motion-reduce:transition-none ${error ? "border-danger focus-within:shadow-[0_0_0_3px_color-mix(in_oklch,var(--color-danger)_16%,transparent)]" : "border-border-strong focus-within:border-brand focus-within:shadow-[0_0_0_3px_color-mix(in_oklch,var(--color-brand)_14%,transparent)]"}`}
      >
        <input
          {...register(name)}
          id={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="min-w-0 w-full border-0 bg-transparent px-3 py-2.5 text-[0.9rem] text-foreground outline-none placeholder:text-subtle"
          maxLength={
            name === "nome"
              ? 120
              : name === "email"
                ? 320
                : name === "senha" || name === "confirmacao"
                  ? 128
                  : undefined
          }
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
        {suffix}
      </div>
      {error && (
        <p className="m-0 text-[0.78rem] text-danger" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default AuthPage;
