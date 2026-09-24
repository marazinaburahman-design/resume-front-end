import * as pdfjsLib from 'pdfjs-dist'

// Add this function
const extractPdfText = async (file) => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
  
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  
  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map(item => item.str).join(' ')
    fullText += pageText + '\n'
  }
  
  return fullText
}

// In submit function, extract PDF text first:
const submit = async () => {
  const trimmedJobTitle = jobTitle.trim()
  
  if (!trimmedJobTitle) {
    setError('Enter a target job title.')
    return
  }

  if (!file && !resumeText.trim()) {
    setError('Upload a PDF or paste your resume text.')
    return
  }

  setLoading(true)
  setError('')

  try {
    let extractedText = resumeText.trim()
    
    // Extract PDF if uploaded
    if (file) {
      extractedText = await extractPdfText(file)
    }

    // Send ONLY text to backend (no PDF file)
    const res = await api.post('/analyses', {
      resumeText: extractedText,
      jobTitle: trimmedJobTitle
    })

    navigate(`/analysis/${res.data.analysis._id}`)
  } catch (err) {
    console.error('Resume analysis error:', err)
    setError(err.response?.data?.message || 'Analysis failed. Please try again.')
  } finally {
    setLoading(false)
  }
}