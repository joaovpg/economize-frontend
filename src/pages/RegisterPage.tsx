import { useState } from "react";
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { z } from "zod";

import { Button } from "../components/Button";
import { TextField } from "../components/TextField";

const emailSchema = z
  .email("Digite um e-mail válido.")
  .min(1, "Digite seu e-mail.")
  .max(320, "Use até 320 caracteres.");

const passwordSchema = z
  .string()
  .min(1, "Digite sua senha.")
  .refine((value) => value.trim().length > 0, "Digite sua senha.");

const cadastroSchema = z
  .object({
    nome: z.string().trim().min(1, "Digite seu nome.").max(120, "Use até 120 caracteres."),
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

type RegisterFormData = {
  nome: string;
  email: string;
  senha: string;
  confirmacao: string;
};

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

function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const timezone = new Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<RegisterFormData>({
    mode: "onSubmit",
    resolver: zodResolver(cadastroSchema),
  });
  const nomeField = register("nome");
  const emailField = register("email");
  const senhaField = register("senha");
  const confirmacaoField = register("confirmacao");

  const handleFormSubmit = () => {
    setSubmitted(true);
  };

  return (
    <>
      <div>
        <span className="mb-7 block h-1 w-10 rounded-full bg-brand" aria-hidden="true" />
        <h1 className="m-0 max-w-[11ch] text-page-title text-foreground" id="auth-title">
          Comece a organizar sua vida financeira.
        </h1>
        <p className="mt-5 max-w-[32ch] text-body-small text-muted">
          Um espaço simples para registrar o que importa e gastar com mais clareza.
        </p>
      </div>

      <div className="mt-10 lg:mt-0">
        {submitted ? (
          <output
            className="grid grid-cols-[auto_1fr] gap-3.5 rounded-xl border border-success bg-success-soft p-4.5 shadow-[0_10px_30px_color-mix(in_oklch,var(--color-success)_8%,transparent)]"
            aria-live="polite"
          >
            <SuccessIcon />
            <div>
              <h2 className="m-0 mt-0.5 mb-1.5 text-[0.95rem] text-foreground">
                Cadastro validado.
              </h2>
              <p className="m-0 text-[0.8rem] leading-normal text-muted">
                Esta é uma demonstração local. Nenhum dado foi enviado ao servidor.
              </p>
            </div>
            <Button
              type="button"
              className="col-start-2 justify-self-start p-0 text-[0.78rem]"
              variant="link"
              onPress={() => setSubmitted(false)}
            >
              Voltar ao formulário
            </Button>
          </output>
        ) : (
          <form className="grid gap-3.5" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
            <TextField
              label="Nome completo"
              name={nomeField.name}
              onBlur={nomeField.onBlur}
              onInput={nomeField.onChange}
              inputRef={nomeField.ref}
              autoComplete="name"
              maxLength={120}
              placeholder="Como você gosta de ser chamado?"
              errorMessage={errors.nome?.message}
            />
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
              description="Use entre 8 e 128 caracteres."
              name={senhaField.name}
              onBlur={senhaField.onBlur}
              onInput={senhaField.onChange}
              inputRef={senhaField.ref}
              type="password"
              autoComplete="new-password"
              maxLength={128}
              placeholder="Crie uma senha segura"
              errorMessage={errors.senha?.message}
            />
            <TextField
              label="Confirme sua senha"
              description="Digite a senha novamente para confirmar."
              name={confirmacaoField.name}
              onBlur={confirmacaoField.onBlur}
              onInput={confirmacaoField.onChange}
              inputRef={confirmacaoField.ref}
              type="password"
              autoComplete="new-password"
              maxLength={128}
              placeholder="Repita sua senha"
              errorMessage={errors.confirmacao?.message}
            />
            <div className="-mt-0.5 flex items-center gap-2.5 text-[0.78rem] text-muted">
              <span className="size-1.75 shrink-0 rounded-full bg-brand" aria-hidden="true" />
              <span>
                Fuso horário detectado: <strong>{timezone}</strong>
              </span>
            </div>
            <Button
              className="mt-1 w-full"
              variant="primary"
              type="submit"
              isPending={isSubmitting}
              trailingIcon={<ArrowRightIcon aria-hidden="true" weight="bold" />}
            >
              {isSubmitting ? "Enviando..." : "Criar minha conta"}
            </Button>
            <p className="m-[0.0625rem_0_0] text-center text-[0.72rem] leading-normal text-subtle">
              Ao continuar, você concorda com uma experiência de controle financeiro mais
              consciente.
            </p>
          </form>
        )}
      </div>
    </>
  );
}

export default RegisterPage;
