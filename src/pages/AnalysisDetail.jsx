import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Lightbulb, Target, XCircle } from 'lucide-react'
import { api } from '../lib/api'
import ScoreRing from '../components/ScoreRing'

export default function AnalysisDetail() {
  const { id } = useParams()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get(`/analyses/${id}`)
      .then((r) => setAnalysis(r.data.analysis))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="py-20 text-center text-zinc-500">Loading analysis…</div>
  }

  if (!analysis) {
    return <div className="py-20 text-center text-red-300">Analysis not found</div>
  }

  return (
    <div>
      <Link to="/history" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white">
        <ArrowLeft size={16} /> Back to history
      </Link>

      <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-lime-300">Resume analysis</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            {analysis.jobTitle}
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            {analysis.fileName} · {new Date(analysis.createdAt).toLocaleString()}
          </p>
        </div>
        <ScoreRing score={analysis.score} />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Section title="Summary">
          <p className="leading-7 text-zinc-400">{analysis.summary}</p>
        </Section>

        <Section title="Skills found" icon={CheckCircle2}>
          <div className="flex flex-wrap gap-2">
            {analysis.skillsFound?.length ? (
              analysis.skillsFound.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-lime-300/10 px-3 py-1.5 text-xs text-lime-300"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-zinc-500">No skills found</p>
            )}
          </div>
        </Section>

        <Section title="Missing skills" icon={XCircle}>
          <div className="space-y-2">
            {analysis.missingSkills?.length ? (
              analysis.missingSkills.map((skill) => (
                <div key={skill} className="flex items-center gap-2 text-sm text-zinc-400">
                  <XCircle size={15} className="text-red-300" />
                  {skill}
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">No missing skills</p>
            )}
          </div>
        </Section>

        <Section title="Suggestions" icon={Lightbulb}>
          <div className="space-y-3">
            {analysis.suggestions?.length ? (
              analysis.suggestions.map((suggestion, i) => (
                <div key={i} className="flex gap-3 text-sm leading-6 text-zinc-400">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/5 text-xs text-zinc-500">
                    {i + 1}
                  </span>
                  {suggestion}
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">No suggestions available</p>
            )}
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[.035] p-6">
      <h2 className="flex items-center gap-2 font-medium">
        {Icon ? (
          <Icon size={17} className="text-lime-300" />
        ) : (
          <Target size={17} className="text-lime-300" />
        )}
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}
