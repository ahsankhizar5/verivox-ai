# VeriVox Live Deployment Checklist

This checklist starts from the validated local Docker image and ends with a live Hugging Face backend plus a Vercel proxy.

## 1. Local Docker Gate

Run this before uploading to Hugging Face:

```powershell
docker build -t verivox-api .
.\scripts\smoke_docker.ps1
```

Expected result:

- `/healthz` returns `status=ok` and `analyzer_loaded=True`.
- A wrong `X-API-Key` returns `401`.
- A valid `/analyze` request returns `200`.
- The response includes `spoof_score`, `text_description`, and `lime_graph_base64`.

## 2. Hugging Face Space

Automated upload path:

```powershell
$env:HF_TOKEN="hf_your_write_token"
$env:HF_SPACE_ID="your-username/verivox-api"
.\scripts\deploy_hf_space.ps1
```

The script creates or updates a private Docker Space, uploads only the required service files, and configures Space secrets from local `.env` or environment variables. Add `-Public` only when the project is ready to be public:

```powershell
.\scripts\deploy_hf_space.ps1 -Public
```

Manual creation path:

- SDK: Docker
- Visibility: private while testing, public only when ready
- Hardware: CPU Basic is acceptable for demo mode

Upload these required files and folders:

- `Dockerfile`
- `.dockerignore`
- `.env.example`
- `README.md`
- `DEPLOYMENT.md`
- `requirements.txt`
- `requirements-deploy.txt`
- `verivox_api.py`
- `lime_inference.py`
- `test_api.py`
- `scripts/deploy_hf_space.py`
- `scripts/deploy_hf_space.ps1`
- `scripts/smoke_docker.ps1`
- `scripts/test_vercel_proxy.py`
- `examples/vercel-proxy/.env.example`
- `examples/vercel-proxy/README.md`
- `examples/vercel-proxy/app/layout.tsx`
- `examples/vercel-proxy/app/page.tsx`
- `examples/vercel-proxy/app/api/analyze/route.ts`
- `examples/vercel-proxy/next.config.ts`
- `examples/vercel-proxy/package.json`
- `examples/vercel-proxy/tsconfig.json`
- `models/AASIST.py`
- `models/__init__.py`
- `config/AASIST.conf`
- `config/best.pth`

Do not upload:

- `.env`
- `.venv/`
- `__pycache__/`
- `lime_graph.png`
- `exp_result/`
- `LA/`

## 3. Hugging Face Secrets

After upload, add these Space secrets in the Hugging Face Space settings:

```text
GROQ_API_KEY=<your Groq key>
API_SECRET_KEY=<long random shared secret>
CONFIG_PATH=config/AASIST.conf
MODEL_DEVICE=cpu
LIME_NUM_CHUNKS=20
LIME_NUM_SAMPLES=20
MAX_PREDICT_WINDOWS=2
PREDICT_TOP_K=3
CM_SCORE_THRESHOLD=2.2389912605285645
CM_SCORE_SCALE=1.0
CONFIDENCE_THRESHOLD=0.60
MEDIUM_CONFIDENCE_THRESHOLD=0.75
FLAT_WINDOW_SPREAD_THRESHOLD=0.02
```

For a slower but more detailed explanation mode:

```text
LIME_NUM_CHUNKS=50
LIME_NUM_SAMPLES=150
```

## 4. Live Backend Test

After the Space finishes building, test health. Use the public Space URL shown by Hugging Face:

```powershell
Invoke-RestMethod https://YOUR-SPACE-URL/healthz
```

Then test analysis:

```powershell
.\.venv\Scripts\python.exe test_api.py `
  --url https://YOUR-SPACE-URL/analyze `
  --audio sample.wav `
  --api-key YOUR_API_SECRET_KEY
```

## 5. Vercel Proxy

The browser must not send `API_SECRET_KEY`.

Copy the Next.js App Router template from:

```text
examples/vercel-proxy/app/api/analyze/route.ts
```

Alternatively, deploy `examples/vercel-proxy/` as a tiny standalone Vercel proxy app.

Use a Vercel server/API route that:

- Accepts the uploaded audio from the frontend.
- Reads `HF_BACKEND_URL` and `API_SECRET_KEY` from Vercel environment variables.
- For normal detection, forwards the audio to `HF_BACKEND_URL/predict`.
- For slower LIME explanations, forwards the audio to `HF_BACKEND_URL/analyze`.
- Adds `X-API-Key: API_SECRET_KEY` server-side.
- Returns the backend JSON unchanged.

Vercel environment variables:

```text
HF_BACKEND_URL=https://YOUR-SPACE-URL
HF_BACKEND_ENDPOINT=predict
API_SECRET_KEY=<same shared secret used in Hugging Face>
```

After the Vercel route is deployed, test the proxy without sending `X-API-Key` from the client:

```powershell
.\.venv\Scripts\python.exe scripts\test_vercel_proxy.py `
  --url https://YOUR-VERCEL-APP.vercel.app/api/analyze `
  --audio sample.wav
```

## 6. Final Acceptance

The system is live when:

- Hugging Face `/healthz` returns analyzer loaded.
- Hugging Face `/analyze` returns valid JSON for `sample.wav`.
- The Vercel proxy returns the same JSON without exposing `API_SECRET_KEY`.
- The frontend renders `lime_graph_base64` as an image.
