import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react'
import { api } from '../lib/api'
import { AuthShell } from './Login'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
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
      // Create the account only.
      // Do NOT call onRegisterSuccess().
      // Do NOT automatically authenticate the user.
      await api.post('/auth/register', form)

      // Registration successful.
      // Send user to login page.
      navigate('/login', {
        replace: true,
        state: {
          message: 'Account created successfully. Please sign in.',
          email: form.email,
        },
      })
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
          err.response?.data?.message ||
          'Unable to create account'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    ['name', UserRound, 'Full name'],
    ['email', Mail, 'Email address'],
    ['password', LockKeyhole, 'Password'],
  ]

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start getting actionable feedback on your resume."
    >
      <form onSubmit={submit} className="space-y-4">

        {fields.map(([key, Icon, placeholder]) => (
          <div key={key} className="relative">

            <Icon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
              size={18}
            />

            <input
              type={key === 'password' ? 'password' : key}
              required
              minLength={key === 'password' ? 6 : undefined}
              disabled={loading}
              value={form[key]}
              onChange={(e) =>
                setForm({
                  ...form,
                  [key]: e.target.value,
                })
              }
              placeholder={placeholder}
              className="w-full rounded-xl border border-white/10 bg-white/[.04] py-3 pl-10 pr-3 outline-none placeholder:text-zinc-600 focus:border-lime-300/60 disabled:cursor-not-allowed disabled:opacity-50"
            />

          </div>
        ))}

        {error && (
          <p className="rounded-lg bg-red-400/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime-300 py-3 font-semibold text-zinc-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            'Creating account…'
          ) : (
            <>
              Create account
              <ArrowRight size={17} />
            </>
          )}
        </button>

      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{' '}

        <Link
          className="text-lime-300 hover:underline"
          to="/login"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  )
}