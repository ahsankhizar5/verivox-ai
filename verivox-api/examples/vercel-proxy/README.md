# Vercel Proxy Template

This directory can be used in either of two ways:

- Copy `app/api/analyze/route.ts` into the real Next.js frontend project.
- Deploy this directory as a tiny standalone Vercel proxy app.

The browser should upload audio to:

```text
POST /api/analyze
```

The Vercel server route forwards the file to the Hugging Face backend and adds `X-API-Key` server-side. The shared API key is never exposed to browser JavaScript.

## Vercel Environment Variables

```text
HF_BACKEND_URL=https://YOUR-SPACE-URL
HF_BACKEND_ENDPOINT=predict
API_SECRET_KEY=<same shared secret used in Hugging Face>
```

For this deployed backend:

```text
HF_BACKEND_URL=https://ahsankhizar-assist-x-backend.hf.space
HF_BACKEND_ENDPOINT=predict
```

## Standalone Local Run

```powershell
cd examples/vercel-proxy
Copy-Item .env.example .env.local
npm install
npm run dev
```

Then test from the backend repo root:

```powershell
.\.venv\Scripts\python.exe scripts\test_vercel_proxy.py --url http://localhost:3000/api/analyze --audio sample.wav
```

## Request

```ts
const formData = new FormData();
formData.append("file", audioFile);

const response = await fetch("/api/analyze", {
  method: "POST",
  body: formData,
});

const payload = await response.json();
```

Expected payload:

```json
{
  "spoof_score": "47.84%",
  "text_description": "...",
  "lime_graph_base64": "data:image/png;base64,..."
}
```
