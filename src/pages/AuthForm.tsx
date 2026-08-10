import { useEffect, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/csr/EyeSlash";
import { TrendUpIcon } from "@phosphor-icons/react/dist/csr/TrendUp";
import { useForm, type UseFormRegister } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

type AuthMode = "login" | "cadastro";

const emailSchema = z
  .email("Digite um e-mail válido.")
  .min(1, "Digite seu e-mail.")
  .max(320, "Use até 320 caracteres.");

const passwordSchema = z
  .string()
  .min(1, "Digite sua senha.")
  .refine((value) => value.trim().length > 0, "Digite sua senha.");

const loginSchema = z.object({
  email: emailSchema,
  senha: passwordSchema,
});

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

function LogoMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <TrendUpIcon size={19} weight="bold" />
    </span>
  );
}

function ArrowIcon() {
  return <ArrowRightIcon aria-hidden="true" size={16} weight="bold" />;
}

function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <EyeIcon aria-hidden="true" size={19} weight="regular" />
  ) : (
    <EyeSlashIcon aria-hidden="true" size={19} weight="regular" />
  );
}

function SuccessIcon() {
  return (
    <span className="success-icon" aria-hidden="true">
      <CheckCircleIcon size={20} weight="regular" />
    </span>
  );
}

function AuthPage({ mode }: { mode: AuthMode }) {
  const isLogin = mode === "login";
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [timezone, setTimezone] = useState("detectando...");
  const navigate = useNavigate();
  const schema = isLogin ? loginSchema : cadastroSchema;
  const {
    formState: { errors },
    handleSubmit,
    register,
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
    navigate(nextMode === "login" ? "/login" : "/cadastro");
  };

  const title = isLogin
    ? "Bom te ver por aqui."
    : "Comece a organizar sua vida financeira.";
  const description = isLogin
    ? "Entre para continuar acompanhando suas escolhas."
    : "Um espaço simples para registrar o que importa e gastar com mais clareza.";

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <header className="auth-header">
          <Link className="brand" to="/login" aria-label="Economize, ir para login">
            <LogoMark />
            <span>economize</span>
          </Link>
          <div className="auth-switch">
            <span>{isLogin ? "Ainda não tem uma conta?" : "Já tem uma conta?"}</span>
            <button
              type="button"
              onClick={() => handleModeChange(isLogin ? "cadastro" : "login")}
            >
              {isLogin ? "Criar conta" : "Entrar"}
            </button>
          </div>
        </header>

        <div className="auth-content">
          <div className="auth-intro">
            <h1 id="auth-title">{title}</h1>
            <p>{description}</p>
          </div>

          {submitted ? (
            <div className="success-message" role="status" aria-live="polite">
              <SuccessIcon />
              <div>
                <h2>{isLogin ? "Entrada validada." : "Cadastro validado."}</h2>
                <p>
                  Esta é uma demonstração local. Nenhum dado foi enviado ao servidor.
                </p>
              </div>
              <button
                type="button"
                className="text-action"
                onClick={() => setSubmitted(false)}
              >
                Voltar ao formulário
              </button>
            </div>
          ) : (
            <form
              className="auth-form"
              onSubmit={handleSubmit(() => setSubmitted(true))}
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
                placeholder={isLogin ? "Digite sua senha" : "Crie uma senha segura"}
                type={showPassword ? "text" : "password"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                error={errors.senha?.message}
                suffix={
                  <button
                    type="button"
                    className="field-action"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
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
                <div className="timezone-note">
                  <span className="timezone-dot" aria-hidden="true" />
                  <span>
                    Fuso horário detectado: <strong>{timezone}</strong>
                  </span>
                </div>
              )}
              {isLogin && (
                <div className="form-meta">
                  <Link to="#" onClick={(event) => event.preventDefault()}>
                    Esqueci minha senha
                  </Link>
                </div>
              )}
              <button className="primary-button" type="submit">
                {isLogin ? "Entrar" : "Criar minha conta"}
                <ArrowIcon />
              </button>
              <p className="form-legal">
                Ao continuar, você concorda com uma experiência de controle financeiro mais consciente.
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
    <div className={`field ${error ? "field--error" : ""}`}>
      <label htmlFor={name}>{label}</label>
      <div className="field-control">
        <input
          {...register(name)}
          id={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
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
        <p className="field-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default AuthPage;
