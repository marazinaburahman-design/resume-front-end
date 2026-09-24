# ResumeAI Frontend

React + Vite + Tailwind CSS frontend for the supplied AI Resume Analyzer backend.

## Run

```bash
npm install
copy .env.example .env
npm run dev
```

The backend should run on `http://localhost:5000` and have `CLIENT_URL=http://localhost:5173`.

## Included

- Login / register / logout using the backend HTTP-only JWT cookie
- Resume PDF drag-and-drop upload
- Target job title + `/api/analyses` multipart submission
- Dashboard with score trend and summary cards
- Analysis detail page
- Analysis history with search and delete
- Responsive dark UI with lime accent
- Recharts, Lucide, Framer Motion, Axios, React Router and React Dropzone
