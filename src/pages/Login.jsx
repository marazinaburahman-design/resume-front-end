import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, LockKeyhole, Mail, Sparkles } from 'lucide-react'
import { api } from '../lib/api'

export default function Login({ onLoginSuccess }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Login → backend sets the HTTP-only cookie.
      // The parent callback performs the single /auth/me request needed
      // to populate the authenticated user state.
      await api.post('/auth/login', form)

      if (onLoginSuccess) {
        await onLoginSuccess()
      }

      // ✅ Navigate (smooth, no refresh)
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
        setError(err.response?.data?.message || 'Unable to sign in')
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
      <form onSubmit={submit} className="space-y-4">
        <Field
          icon={Mail}
          placeholder="Email address"
          type="email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          disabled={loading}
        />
        <Field
          icon={LockKeyhole}
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(v) => setForm({ ...form, password: v })}
          disabled={loading}
        />
        {error && (
          <p className="rounded-lg bg-red-400/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <button
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime-300 py-3 font-semibold text-zinc-950 hover:bg-lime-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Signing in…' : 'Sign in'} <ArrowRight size={17} />
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-zinc-500">
        New here?{' '}
        <Link className="text-lime-300 hover:underline" to="/register">
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}

function Field({ icon: Icon, disabled, ...p }) {
  return (
    <div className="relative">
      <Icon
        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
        size={18}
      />
      <input
        {...p}
        disabled={disabled}
        onChange={(e) => p.onChange(e.target.value)}
        required
        className="w-full rounded-xl border border-white/10 bg-white/[.04] py-3 pl-10 pr-3 outline-none placeholder:text-zinc-600 focus:border-lime-300/60 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  )
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-lime-300 p-12 text-zinc-950">
        <div className="flex items-center gap-2 font-semibold">
          <Sparkles size={19} /> ResumeAI
        </div>
        <div>
          <p className="max-w-xl text-6xl font-semibold leading-[.95] tracking-[-.05em]">
            Make your resume work harder.
          </p>
          <p className="mt-6 max-w-md text-zinc-800">
            Upload a PDF, choose a target role, and get a clear match score with
            practical improvement ideas.
          </p>
        </div>
        <p className="text-sm text-zinc-700">
          Private analysis · Fast feedback · Built for job seekers
        </p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden flex items-center gap-2 font-semibold">
            <Sparkles className="text-lime-300" size={19} /> ResumeAI
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
