import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Sparkles,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '../lib/api'

export default function Analyze() {
  const [resumeText, setResumeText] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  // Submit resume for AI analysis
  const submit = async () => {
    const trimmedJobTitle = jobTitle.trim()
    const trimmedResume = resumeText.trim()

    if (!trimmedResume || !trimmedJobTitle) {
      setError('Add a target role and paste your resume.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await api.post('/analyses', {
        resumeText: trimmedResume,
        jobTitle: trimmedJobTitle,
      })

      navigate(`/analysis/${res.data.analysis._id}`)
    } catch (err) {
      console.error('Resume analysis error:', err)

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Analysis failed. Please try again.'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  // Button should only be enabled when:
  // 1. Resume text exists
  // 2. Job title contains real text
  // 3. Request is not currently loading
  const canSubmit =
    !loading &&
    !!resumeText.trim() &&
    !!jobTitle.trim()

  const charCount = resumeText.length

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 flex items-center gap-2 text-sm text-lime-300">
          <Sparkles size={15} />
          AI resume analysis
        </p>

        <h1 className="text-4xl font-semibold tracking-tight">
          Analyze your resume
        </h1>

        <p className="mt-2 text-zinc-500">
          Paste your resume and tell us which role you're targeting.
        </p>
      </div>

      <div className="space-y-5">

        {/* Target Job Title */}
        <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
          <label
            htmlFor="jobTitle"
            className="text-sm font-medium"
          >
            Target job title
          </label>

          <input
            id="jobTitle"
            type="text"
            value={jobTitle}
            onChange={(e) => {
              setJobTitle(e.target.value)
              if (error) setError('')
            }}
            placeholder="e.g. Frontend Developer"
            className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none placeholder:text-zinc-700 focus:border-lime-300/60"
          />

          <p className="mt-2 text-xs text-zinc-600">
            Example: Frontend Developer, Full-Stack Developer, React Developer
          </p>
        </div>

        {/* Resume Text Input */}
        <motion.div
          className="rounded-2xl border border-white/15 bg-white/[.02] p-5 hover:border-white/30 transition"
        >
          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor="resume"
              className="text-sm font-medium flex items-center gap-2"
            >
              <FileText size={16} className="text-lime-300" />
              Your resume
            </label>
            <span className="text-xs text-zinc-600">
              {charCount} characters
            </span>
          </div>

          <textarea
            id="resume"
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value)
              if (error) setError('')
            }}
            placeholder="Paste your resume here..."
            className="w-full h-80 rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none placeholder:text-zinc-700 focus:border-lime-300/60 resize-none"
          />

          <p className="mt-2 text-xs text-zinc-600">
            Copy and paste your entire resume or CV text above.
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3">
            <p className="text-sm text-red-300">
              {error}
            </p>
          </div>
        )}

        {/* Analyze Button */}
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold transition ${
            canSubmit
              ? 'bg-lime-300 text-zinc-950 hover:bg-lime-200'
              : 'cursor-not-allowed bg-lime-300 text-zinc-950 opacity-40'
          }`}
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950" />
              Analyzing resume…
            </>
          ) : (
            <>
              Analyze resume
              <Sparkles size={17} />
            </>
          )}
        </button>

        {/* Status */}
        {!resumeText.trim() && !jobTitle.trim() && (
          <p className="text-center text-xs text-zinc-600">
            Paste your resume and enter the target job title to continue.
          </p>
        )}

        {resumeText.trim() && !jobTitle.trim() && (
          <p className="text-center text-xs text-zinc-600">
            Resume added. Enter a target job title to continue.
          </p>
        )}

        {!resumeText.trim() && jobTitle.trim() && (
          <p className="text-center text-xs text-zinc-600">
            Target role added. Paste your resume to continue.
          </p>
        )}
      </div>
    </div>
  )
}