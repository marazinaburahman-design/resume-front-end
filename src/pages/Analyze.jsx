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
import { api } from '../lib/api'
import * as pdfjsLib from 'pdfjs-dist'

/*
|--------------------------------------------------------------------------
| PDF TEXT EXTRACTION
|--------------------------------------------------------------------------
*/

const extractPdfText = async (file) => {
  console.log('Starting PDF text extraction...')

  // Use the worker bundled with pdfjs-dist instead of Cloudflare CDN.
  // This avoids the "Setting up fake worker" / 404 problem.
  const pdfjsWorker = await import(
    'pdfjs-dist/build/pdf.worker.min.mjs?url'
  )

  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default

  const arrayBuffer = await file.arrayBuffer()

  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
  }).promise

  let fullText = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)

    const textContent = await page.getTextContent()

    const pageText = textContent.items
      .map((item) => item.str)
      .join(' ')

    fullText += pageText + '\n'
  }

  console.log('PDF text extracted successfully.')
  console.log('Extracted text length:', fullText.length)

  return fullText
}

/*
|--------------------------------------------------------------------------
| ANALYZE PAGE
|--------------------------------------------------------------------------
*/

function Analyze() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

  /*
  |--------------------------------------------------------------------------
  | PDF PREVIEW
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | DROPZONE
  |--------------------------------------------------------------------------
  */

  const onDrop = useCallback((files) => {
    if (files && files[0]) {
      const selectedFile = files[0]

      console.log('Selected file:', selectedFile.name)

      setFile(selectedFile)
      setError('')
    }
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

  /*
  |--------------------------------------------------------------------------
  | REMOVE FILE
  |--------------------------------------------------------------------------
  */

  const removeFile = (e) => {
    e.stopPropagation()

    setFile(null)
    setPreviewUrl('')
    setError('')
  }

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const submit = async () => {
    const trimmedJobTitle = jobTitle.trim()

    /*
    |--------------------------------------------------------------------------
    | VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!trimmedJobTitle) {
      setError('Enter a target job title.')
      return
    }

    if (!file) {
      setError('Upload a PDF resume.')
      return
    }

    setLoading(true)
    setError('')

    try {
      /*
      |--------------------------------------------------------------------------
      | STEP 1 - EXTRACT PDF TEXT
      |--------------------------------------------------------------------------
      */

      console.log('Starting PDF text extraction...')

      const resumeText = await extractPdfText(file)

      if (!resumeText || !resumeText.trim()) {
        throw new Error(
          'Could not extract text from PDF. Try another PDF file.'
        )
      }

      console.log('PDF text extracted successfully.')
      console.log('Extracted text length:', resumeText.length)

      /*
      |--------------------------------------------------------------------------
      | STEP 2 - SEND TEXT TO BACKEND
      |--------------------------------------------------------------------------
      */

      console.log('Sending resume text to backend...')

      const res = await api.post('/analyses', {
        resumeText: resumeText.trim(),
        jobTitle: trimmedJobTitle,
      })

      /*
      |--------------------------------------------------------------------------
      | DEBUG BACKEND RESPONSE
      |--------------------------------------------------------------------------
      */

      console.log('========================================')
      console.log('FULL BACKEND RESPONSE:')
      console.log(res)

      console.log('========================================')
      console.log('BACKEND RESPONSE DATA:')
      console.log(res.data)

      console.log(
        'BACKEND RESPONSE JSON:',
        JSON.stringify(res.data, null, 2)
      )

      /*
      |--------------------------------------------------------------------------
      | IMPORTANT
      |--------------------------------------------------------------------------
      |
      | Your backend currently returns:
      |
      | {
      |   score: 78,
      |   summary: "...",
      |   skillsFound: [...],
      |   missingSkills: [...],
      |   suggestions: [...]
      | }
      |
      | It DOES NOT return:
      |
      | analysis._id
      | analysisId
      |
      |--------------------------------------------------------------------------
      */

      const data = res.data

      /*
      |--------------------------------------------------------------------------
      | TRY ALL COMMON ID LOCATIONS
      |--------------------------------------------------------------------------
      */

      const analysisId =
        data?.analysis?._id ||
        data?.analysis?.id ||
        data?.analysisId ||
        data?.id ||
        data?._id ||
        null

      console.log('FOUND ANALYSIS ID:', analysisId)

      /*
      |--------------------------------------------------------------------------
      | CASE 1 - BACKEND RETURNED AN ID
      |--------------------------------------------------------------------------
      */

      if (analysisId) {
        console.log(
          'Navigating to analysis:',
          `/analysis/${analysisId}`
        )

        navigate(`/analysis/${analysisId}`)
        return
      }

      /*
      |--------------------------------------------------------------------------
      | CASE 2 - BACKEND RETURNED ANALYSIS RESULT BUT NO ID
      |--------------------------------------------------------------------------
      |
      | Save the result locally so it isn't lost.
      |
      */

      if (
        data &&
        typeof data === 'object' &&
        (
          data.score !== undefined ||
          data.summary ||
          data.skillsFound ||
          data.missingSkills ||
          data.suggestions
        )
      ) {
        console.warn(
          'Backend returned analysis data but no analysis ID.'
        )

        console.log(
          'Saving analysis result to localStorage...'
        )

        const analysisResult = {
          ...data,
          jobTitle: trimmedJobTitle,
          resumeText: resumeText.trim(),
          createdAt: new Date().toISOString(),
        }

        localStorage.setItem(
          'latestAnalysis',
          JSON.stringify(analysisResult)
        )

        /*
        |--------------------------------------------------------------------------
        | Temporary route
        |--------------------------------------------------------------------------
        |
        | This route is useful if you create an AnalysisResult page.
        |
        */

        navigate('/analysis/result', {
          state: {
            analysis: analysisResult,
          },
        })

        return
      }

      /*
      |--------------------------------------------------------------------------
      | CASE 3 - UNKNOWN RESPONSE
      |--------------------------------------------------------------------------
      */

      throw new Error(
        'Backend completed the request but returned an unexpected response.'
      )
    } catch (err) {
      console.error('========================================')
      console.error('ANALYSIS ERROR:', err)
      console.error('ERROR RESPONSE:', err?.response?.data)
      console.error('ERROR STATUS:', err?.response?.status)
      console.error('========================================')

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message

      setError(
        backendMessage ||
          'Analysis failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  /*
  |--------------------------------------------------------------------------
  | UI
  |--------------------------------------------------------------------------
  */

  return (
    <div className="mx-auto max-w-5xl">

      {/* HEADER */}
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

        {/* JOB TITLE */}
        <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5">

          <label className="text-sm font-medium">
            Target job title
          </label>

          <input
            value={jobTitle}
            onChange={(e) => {
              setJobTitle(e.target.value)
              setError('')
            }}
            placeholder="e.g. Frontend Developer"
            className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none placeholder:text-zinc-700 focus:border-lime-300/60"
          />

        </div>

        {/* DROPZONE */}
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-2xl border border-dashed p-5 transition ${
            isDragActive
              ? 'border-lime-300 bg-lime-300/5'
              : 'border-white/15 bg-white/[.02] hover:border-white/30'
          }`}
        >

          <input {...getInputProps()} />

          {file ? (

            <div className="grid gap-5 md:grid-cols-[1fr_300px]">

              {/* PDF PREVIEW */}
              <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">

                {/* FILE HEADER */}
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
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      className="ml-3 shrink-0 text-zinc-500 hover:text-white"
                    >
                      <Maximize2 size={16} />
                    </a>
                  )}

                </div>

                {/* IFRAME */}
                {previewUrl && (
                  <iframe
                    src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                    title="Resume PDF preview"
                    className="h-[520px] w-full bg-white"
                  />
                )}

              </div>

              {/* FILE INFO */}
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

                <p className="mt-6 text-center text-xs text-zinc-600">
                  Click to replace PDF
                </p>

              </div>

            </div>

          ) : (

            /* EMPTY UPLOAD AREA */
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

        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-300">
              {error}
            </p>
          </div>
        )}

        {/* SUBMIT */}
        <button
          type="button"
          onClick={submit}
          disabled={
            loading ||
            !file ||
            !jobTitle.trim()
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-lime-300 py-3.5 font-semibold text-zinc-950 transition hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-40"
        >

          {loading
            ? 'Analyzing resume…'
            : 'Analyze resume'}

          <Sparkles size={17} />

        </button>

      </div>
    </div>
  )
}

export default Analyze