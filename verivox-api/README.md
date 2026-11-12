---
title: VeriVox API
sdk: docker
app_port: 7860
---

# VeriVox API

VeriVox is a FastAPI service for audio anti-spoofing and deepfake detection using the AASIST model plus LIME-based explanation output.

The live API accepts an audio file, runs inference, creates a LIME heatmap over the waveform, and returns JSON for the frontend.

## API contract

`GET /healthz`

Returns service health and whether the analyzer has been loaded.

`POST /predict`

Fast endpoint for the frontend. It performs multi-window 4-second inference and skips LIME/Groq.

`POST /analyze`

Request:
- Multipart field: `file`
- Header: `X-API-Key`
- Supported file extensions: `.wav`, `.flac`, `.mp3`, `.m4a`

Response:

```json
{
  "spoof_score": "95.12%",
  "bonafide_score": "4.88%",
  "predicted_label": "spoof",
  "confidence": "95.12%",
  "confidence_level": "high",
  "is_uncertain": false,
  "warning": null,
  "text_description": "LIME anomaly isolated between ...",
  "lime_graph_base64": "data:image/png;base64,..."
}
```

## Required files

The inference service needs these files at runtime:

- `verivox_api.py`
- `lime_inference.py`
- `models/AASIST.py`
- `config/AASIST.conf`
- `config/best.pth`

`config/AASIST.conf` currently uses `"model_path": "./best.pth"`. The analyzer resolves that relative to the config file, so the expected model path is `config/best.pth`.

## Environment

Create a local `.env` from `.env.example`:

```powershell
Copy-Item .env.example .env
```

Set these values:

- `GROQ_API_KEY`: Groq key used for report text generation.
- `API_SECRET_KEY`: shared secret required by the `X-API-Key` request header.
- `CONFIG_PATH`: defaults to `config/AASIST.conf`.
- `MODEL_DEVICE`: use `cpu` for local and Hugging Face free-tier deployment.
- `LIME_NUM_CHUNKS`: defaults to `20` for faster demo response.
- `LIME_NUM_SAMPLES`: defaults to `20` for faster demo response.
- `MAX_PREDICT_WINDOWS`: defaults to `2` for fast top-energy multi-window prediction.
- `PREDICT_TOP_K`: defaults to `3` for debug aggregation over top spoof windows.
- `CM_SCORE_THRESHOLD`: defaults to `2.2389912605285645`, the EER threshold calculated from the saved ASVspoof eval scores.
- `CM_SCORE_SCALE`: defaults to `1.0`; controls how raw CM score distance is mapped into displayed confidence.
- `CONFIDENCE_THRESHOLD`: defaults to `0.60`; below this, the result is marked uncertain.
- `MEDIUM_CONFIDENCE_THRESHOLD`: defaults to `0.75`; results from 0.60 to 0.75 are marked medium confidence.
- `FLAT_WINDOW_SPREAD_THRESHOLD`: defaults to `0.02`; very similar candidate-window scores are flagged as low evidence/out-of-distribution risk.

For higher-quality, slower explanations, use `LIME_NUM_CHUNKS=50` and `LIME_NUM_SAMPLES=150`.

## Local run

For a fresh local environment, use Python 3.11 to match the Docker runtime. Your existing `.venv` can also be used if the import checks pass.

```powershell
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install --index-url https://download.pytorch.org/whl/cpu torch==2.3.1
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn verivox_api:app --host 0.0.0.0 --port 8000
```

In another terminal, test the API:

```powershell
.\.venv\Scripts\python.exe test_api.py --audio sample.wav --api-key YOUR_API_SECRET_KEY
```

The client saves the returned LIME image to `lime_graph.png`.

Quick health check:

```powershell
Invoke-RestMethod http://localhost:8000/healthz
```

## Docker run

Build:

```powershell
docker build -t verivox-api .
```

Repeat the validated Docker smoke test:

```powershell
.\scripts\smoke_docker.ps1
```

Run:

```powershell
docker run --rm -p 7860:7860 `
  -e GROQ_API_KEY=YOUR_GROQ_API_KEY `
  -e API_SECRET_KEY=YOUR_API_SECRET_KEY `
  -e CONFIG_PATH=config/AASIST.conf `
  -e MODEL_DEVICE=cpu `
  -e LIME_NUM_CHUNKS=20 `
  -e LIME_NUM_SAMPLES=20 `
  -e MAX_PREDICT_WINDOWS=2 `
  -e PREDICT_TOP_K=3 `
  -e CM_SCORE_THRESHOLD=2.2389912605285645 `
  -e CONFIDENCE_THRESHOLD=0.60 `
  verivox-api
```

Test:

```powershell
.\.venv\Scripts\python.exe test_api.py --url http://localhost:7860/analyze --audio sample.wav --api-key YOUR_API_SECRET_KEY
```

## Hugging Face Spaces

See `DEPLOYMENT.md` for the full live deployment checklist.

Scripted upload path:

```powershell
$env:HF_TOKEN="hf_your_write_token"
$env:HF_SPACE_ID="your-username/verivox-api"
.\scripts\deploy_hf_space.ps1
```

Create a Docker Space and upload this repository with:

- `Dockerfile`
- `requirements.txt`
- `verivox_api.py`
- `lime_inference.py`
- `models/AASIST.py`
- `config/AASIST.conf`
- `config/best.pth`

Add these Space secrets:

- `GROQ_API_KEY`
- `API_SECRET_KEY`
- `CONFIG_PATH=config/AASIST.conf`
- `MODEL_DEVICE=cpu`
- `LIME_NUM_CHUNKS=20`
- `LIME_NUM_SAMPLES=20`
- `MAX_PREDICT_WINDOWS=2`
- `PREDICT_TOP_K=3`
- `CM_SCORE_THRESHOLD=2.2389912605285645`
- `CM_SCORE_SCALE=1.0`
- `CONFIDENCE_THRESHOLD=0.60`
- `MEDIUM_CONFIDENCE_THRESHOLD=0.75`
- `FLAT_WINDOW_SPREAD_THRESHOLD=0.02`

Hugging Face exposes the container on port `7860`, which is already configured in the Dockerfile.

## Frontend integration

Do not send `API_SECRET_KEY` from browser JavaScript.

The Vercel frontend should call a Vercel server/API route. That server route stores the secret and forwards uploads to the Hugging Face `/analyze` endpoint with the `X-API-Key` header.

A Next.js App Router template is available at `examples/vercel-proxy/app/api/analyze/route.ts`.

After deploying the Vercel route, test it without sending `X-API-Key` from the client:

```powershell
.\.venv\Scripts\python.exe scripts\test_vercel_proxy.py --url https://YOUR-VERCEL-APP.vercel.app/api/analyze --audio sample.wav
```

## Notes

This project is built on the open-source AASIST anti-spoofing implementation. The original training and evaluation scripts remain in the repository for reference, but the live service path is the FastAPI inference API.
