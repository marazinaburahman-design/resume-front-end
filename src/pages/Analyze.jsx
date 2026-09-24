import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  UploadCloud,
  X,
  Sparkles,
  Maximize2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { api } from '../lib/api'

export default function Analyze() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  // Create PDF preview URL
  useEffect(() => {
    if (!file) {
      setPreviewUrl('')
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  // Handle file upload
  const onDrop = useCallback((files) => {
    if (!files || !files.length) return

    const selectedFile = files[0]

    // Extra validation
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF resume.')
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('PDF must be smaller than 5 MB.')
      return
    }

    setFile(selectedFile)
    setError('')
  }, [])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024,
  })

  // Remove uploaded file
  const removeFile = (e) => {
    e.stopPropagation()

    setFile(null)
    setPreviewUrl('')
    setError('')
  }

  // Submit resume for AI analysis
  const submit = async () => {
    const trimmedJobTitle = jobTitle.trim()

    if (!file || !trimmedJobTitle) {
      setError('Add a target role and upload a PDF resume.')
      return
    }

    setLoading(true)
    setError('')

    const data = new FormData()

    data.append('resume', file)
    data.append('jobTitle', trimmedJobTitle)

    try {
      const res = await api.post('/analyses', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
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
  // 1. PDF exists
  // 2. Job title contains real text
  // 3. Request is not currently loading
  const canSubmit =
    !loading &&
    !!file &&
    !!jobTitle.trim()

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
          Upload your PDF and tell us which role you're targeting.
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

              if (error) {
                setError('')
              }
            }}
            placeholder="e.g. Frontend Developer"
            className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none placeholder:text-zinc-700 focus:border-lime-300/60"
          />

          <p className="mt-2 text-xs text-zinc-600">
            Example: Frontend Developer, Full-Stack Developer, React Developer
          </p>
        </div>

        {/* PDF Upload */}
        <motion.div
          {...getRootProps()}
          whileHover={{ scale: 1.002 }}
          className={`rounded-2xl border border-dashed p-5 transition ${
            isDragActive
              ? 'border-lime-300 bg-lime-300/5'
              : 'border-white/15 bg-white/[.02] hover:border-white/30'
          }`}
        >
          <input {...getInputProps()} />

          {file ? (
            <div className="grid gap-5 md:grid-cols-[1fr_300px]">

              {/* PDF Preview */}
              <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">

                  <div className="flex min-w-0 items-center gap-2">
                    <FileText
                      size={16}
                      className="shrink-0 text-red-300"
                    />

                    <span className="truncate text-sm font-medium">
                      {file.name}
                    </span>
                  </div>

                  {previewUrl && (
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="ml-3 shrink-0 text-zinc-500 hover:text-white"
                      title="Open PDF in new tab"
                    >
                      <Maximize2 size={16} />
                    </a>
                  )}
                </div>

                {previewUrl && (
                  <iframe
                    src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                    title="Resume PDF preview"
                    className="h-[520px] w-full bg-white"
                  />
                )}
              </div>

              {/* File Information */}
              <div className="flex flex-col justify-center rounded-xl border border-white/10 bg-white/[.02] p-5">

                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-400/10 text-red-300">
                  <FileText size={27} />
                </div>

                <p className="mt-4 break-words text-center font-medium">
                  {file.name}
                </p>

                <p className="mt-1 text-center text-xs text-zinc-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB · PDF
                </p>

                <button
                  type="button"
                  onClick={removeFile}
                  className="mx-auto mt-5 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white"
                >
                  <X size={14} />
                  Remove
                </button>

                <p className="mt-6 text-center text-xs leading-5 text-zinc-600">
                  Click anywhere in this area to replace the PDF.
                </p>
              </div>
            </div>
          ) : (
            /* Empty Upload State */
            <div className="py-10 text-center">

              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-lime-300/10 text-lime-300">
                <UploadCloud />
              </div>

              <p className="mt-4 font-medium">
                {isDragActive
                  ? 'Drop your resume here'
                  : 'Drag & drop your resume here'}
              </p>

              <p className="mt-1 text-sm text-zinc-600">
                or click to browse · PDF up to 5 MB
              </p>
            </div>
          )}
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
        {!file && !jobTitle.trim() && (
          <p className="text-center text-xs text-zinc-600">
            Upload your PDF and enter the target job title to continue.
          </p>
        )}

        {file && !jobTitle.trim() && (
          <p className="text-center text-xs text-zinc-600">
            PDF uploaded. Enter a target job title to continue.
          </p>
        )}

        {!file && jobTitle.trim() && (
          <p className="text-center text-xs text-zinc-600">
            Target role added. Upload your PDF to continue.
          </p>
        )}
      </div>
    </div>
  )
}