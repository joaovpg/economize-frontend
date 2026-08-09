import { useEffect, useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormRegister } from 'react-hook-form'
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom'
import { z } from 'zod'

type AuthMode = 'login' | 'cadastro'

const emailSchema = z
  .string()
  .min(1, 'Digite seu e-mail.')
  .max(320, 'Use até 320 caracteres.')
  .email('Digite um e-mail válido.')

const passwordSchema = z
  .string()
  .min(1, 'Digite sua senha.')
  .refine((value) => value.trim().length > 0, 'Digite sua senha.')

const loginSchema = z.object({
  email: emailSchema,
  senha: passwordSchema,
})

const cadastroSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(1, 'Digite seu nome.')
      .max(120, 'Use até 120 caracteres.'),
    email: emailSchema,
    senha: passwordSchema
      .min(8, 'A senha deve ter entre 8 e 128 caracteres.')
      .max(128, 'A senha deve ter entre 8 e 128 caracteres.'),
    confirmacao: z.string(),
  })
  .refine((data) => data.senha === data.confirmacao, {
    path: ['confirmacao'],
    message: 'As senhas não coincidem.',
  })

type AuthFormData = {
  nome?: string
  email: string
  senha: string
  confirmacao?: string
}

function LogoMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path d="M5 22.5 12.5 15l5 5L27 10.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21 10.5h6v6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="none">
      <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" fill="none">
      {visible ? (
        <>
          <path d="M2.5 10s2.6-4.25 7.5-4.25S17.5 10 17.5 10 14.9 14.25 10 14.25 2.5 10 2.5 10Z" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
        </>
      ) : (
        <>
          <path d="m3 3 14 14M8.2 5.95A8.7 8.7 0 0 1 10 5.75c4.9 0 7.5 4.25 7.5 4.25a14 14 0 0 1-2.15 2.55M5.55 6.9C3.5 8.3 2.5 10 2.5 10s2.6 4.25 7.5 4.25c.63 0 1.22-.08 1.77-.22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
    </svg>
  )
}

function SuccessIcon() {
  return (
    <span className="success-icon" aria-hidden="true">
      <svg viewBox="0 0 20 20" fill="none">
        <path d="m5 10.2 3.2 3.1L15 6.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/cadastro" element={<AuthPage mode="cadastro" />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

function AuthPage({ mode }: { mode: AuthMode }) {
  const isLogin = mode === 'login'
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [timezone, setTimezone] = useState('detectando...')
  const navigate = useNavigate()
  const schema = isLogin ? loginSchema : cadastroSchema
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<AuthFormData>({
    mode: 'onSubmit',
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    try {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
    } catch {
      setTimezone('UTC')
    }
  }, [])

  const handleModeChange = (nextMode: AuthMode) => {
    setSubmitted(false)
    navigate(nextMode === 'login' ? '/login' : '/cadastro')
  }

  const title = isLogin ? 'Bom te ver por aqui.' : 'Comece a organizar sua vida financeira.'
  const description = isLogin ? 'Entre para continuar acompanhando suas escolhas.' : 'Um espaço simples para registrar o que importa e gastar com mais clareza.'

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <header className="auth-header">
          <Link className="brand" to="/login" aria-label="Economize, ir para login"><LogoMark /><span>economize</span></Link>
          <div className="auth-switch">
            <span>{isLogin ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}</span>
            <button type="button" onClick={() => handleModeChange(isLogin ? 'cadastro' : 'login')}>{isLogin ? 'Criar conta' : 'Entrar'}</button>
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
                <h2>{isLogin ? 'Entrada validada.' : 'Cadastro validado.'}</h2>
                <p>Esta é uma demonstração local. Nenhum dado foi enviado ao servidor.</p>
              </div>
              <button type="button" className="text-action" onClick={() => setSubmitted(false)}>Voltar ao formulário</button>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit(() => setSubmitted(true))} noValidate>
              {!isLogin && <Field register={register} name="nome" label="Nome completo" placeholder="Como você gosta de ser chamado?" autoComplete="name" error={errors.nome?.message} />}
              <Field register={register} name="email" label="E-mail" placeholder="voce@exemplo.com" type="email" autoComplete="email" error={errors.email?.message} />
              <Field register={register} name="senha" label="Senha" placeholder={isLogin ? 'Digite sua senha' : 'Crie uma senha segura'} type={showPassword ? 'text' : 'password'} autoComplete={isLogin ? 'current-password' : 'new-password'} error={errors.senha?.message} suffix={<button type="button" className="field-action" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword(!showPassword)}><EyeIcon visible={showPassword} /></button>} />
              {!isLogin && <Field register={register} name="confirmacao" label="Confirme sua senha" placeholder="Repita sua senha" type="password" autoComplete="new-password" error={errors.confirmacao?.message} />}
              {!isLogin && <div className="timezone-note"><span className="timezone-dot" aria-hidden="true" /><span>Fuso horário detectado: <strong>{timezone}</strong></span></div>}
              {isLogin && <div className="form-meta"><Link to="#" onClick={(event) => event.preventDefault()}>Esqueci minha senha</Link></div>}
              <button className="primary-button" type="submit">{isLogin ? 'Entrar' : 'Criar minha conta'}<ArrowIcon /></button>
              <p className="form-legal">Ao continuar, você concorda com uma experiência de controle financeiro mais consciente.</p>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}

function Field({ register, name, label, placeholder, type = 'text', autoComplete, error, suffix }: { register: UseFormRegister<AuthFormData>; name: keyof AuthFormData; label: string; placeholder: string; type?: string; autoComplete?: string; error?: string; suffix?: ReactNode }) {
  const errorId = `${name}-error`
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label htmlFor={name}>{label}</label>
      <div className="field-control">
        <input {...register(name)} id={name} type={type} placeholder={placeholder} autoComplete={autoComplete} maxLength={name === 'nome' ? 120 : name === 'email' ? 320 : name === 'senha' || name === 'confirmacao' ? 128 : undefined} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />
        {suffix}
      </div>
      {error && <p className="field-error" id={errorId} role="alert">{error}</p>}
    </div>
  )
}

export default App
