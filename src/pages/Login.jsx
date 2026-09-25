import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  Sparkles,
} from 'lucide-react'
import { api } from '../lib/api'

export default function Login({ onLoginSuccess }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()

    setError('')
    setLoading(true)

    try {
      // Login → backend sets the HTTP-only cookie.
      // The parent callback performs the single /auth/me request.
      await api.post('/auth/login', form)

      if (onLoginSuccess) {
        await onLoginSuccess()
      }

      navigate('/analyze')
    } catch (err) {
      if (err.response?.status === 429) {
        const retryAfter = err.response.headers?.['retry-after']

        setError(
          retryAfter
            ? `Too many requests. Please wait ${retryAfter} seconds and try again.`
            : 'Too many requests. Please wait a moment and try again.'
        )
      } else {
        setError(
          err.response?.data?.message || 'Unable to sign in'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue analyzing your resumes."
    >
      <form
        onSubmit={submit}
        className="w-full space-y-4"
      >
        <Field
          icon={Mail}
          placeholder="Email address"
          type="email"
          value={form.email}
          onChange={(v) =>
            setForm({
              ...form,
              email: v,
            })
          }
          disabled={loading}
        />

        <Field
          icon={LockKeyhole}
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(v) =>
            setForm({
              ...form,
              password: v,
            })
          }
          disabled={loading}
        />

        {error && (
          <p className="rounded-lg bg-red-400/10 px-3 py-2 text-sm leading-5 text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-lime-300
            px-4
            py-3.5
            text-sm
            font-semibold
            text-zinc-950
            transition
            hover:bg-lime-200
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading ? 'Signing in…' : 'Sign in'}
          <ArrowRight size={17} />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        New here?{' '}
        <Link
          className="text-lime-300 hover:underline"
          to="/register"
        >
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}

function Field({
  icon: Icon,
  disabled,
  ...props
}) {
  return (
    <div className="relative w-full">
      <Icon
        className="
          absolute
          left-3
          top-1/2
          -translate-y-1/2
          text-zinc-500
        "
        size={18}
      />

      <input
        {...props}
        disabled={disabled}
        onChange={(e) => props.onChange(e.target.value)}
        required
        className="
          w-full
          rounded-xl
          border
          border-white/10
          bg-white/[.04]
          px-3
          py-3.5
          pl-10
          text-sm
          text-white
          outline-none
          placeholder:text-zinc-600
          focus:border-lime-300/60
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      />
    </div>
  )
}

export function AuthShell({
  title,
  subtitle,
  children,
}) {
  return (
    <div
      className="
        min-h-screen
        w-full
        bg-[#09090b]
        lg:grid
        lg:grid-cols-2
      "
    >
      {/* =========================
          DESKTOP LEFT PANEL
          ========================= */}
      <div
        className="
          hidden
          min-h-screen
          flex-col
          justify-between
          bg-lime-300
          p-12
          text-zinc-950
          lg:flex
        "
      >
        {/* Logo */}
        <div className="flex items-center gap-2 font-semibold">
          <Sparkles size={19} />
          <span>ResumeAI</span>
        </div>

        {/* Main message */}
        <div>
          <p
            className="
              max-w-xl
              text-5xl
              font-semibold
              leading-[.95]
              tracking-[-0.05em]
              xl:text-6xl
            "
          >
            Make your resume work harder.
          </p>

          <p className="mt-6 max-w-md text-zinc-800">
            Upload a PDF, choose a target role,
            and get a clear match score with
            practical improvement ideas.
          </p>
        </div>

        {/* Footer */}
        <p className="text-sm text-zinc-700">
          Private analysis · Fast feedback · Built for job seekers
        </p>
      </div>

      {/* =========================
          LOGIN / REGISTER AREA
          ========================= */}
      <div
        className="
          flex
          min-h-screen
          w-full
          items-center
          justify-center
          px-5
          py-10
          sm:px-6
          lg:px-8
        "
      >
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div
            className="
              mb-8
              flex
              items-center
              gap-2
              font-semibold
              lg:hidden
            "
          >
            <Sparkles
              className="text-lime-300"
              size={19}
            />

            <span>ResumeAI</span>
          </div>

          {/* Heading */}
          <h1
            className="
              text-3xl
              font-semibold
              tracking-tight
              sm:text-4xl
            "
          >
            {title}
          </h1>

          {/* Subtitle */}
          <p
            className="
              mt-2
              text-sm
              leading-6
              text-zinc-500
            "
          >
            {subtitle}
          </p>

          {/* Form */}
          <div className="mt-8 w-full">
            {children}
          </div>

        </div>
      </div>
    </div>
  )
}