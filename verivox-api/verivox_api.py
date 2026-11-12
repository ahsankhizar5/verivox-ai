"""
FastAPI wrapper for VeriVox LIME Analyzer.

Usage:
1. Create a `.env` file containing `GROQ_API_KEY=your_key_here` and `API_SECRET_KEY=your_api_secret`.
2. Start the server:
    uvicorn verivox_api:app --host 0.0.0.0 --port 8000

Endpoint:
- POST /analyze (multipart file field `file`) -> JSON {spoof_score, text_description, lime_graph_base64}
"""

import os
import io
import base64
import tempfile
import asyncio
import logging
import secrets
from contextlib import asynccontextmanager
from typing import Dict, Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, Header, status, Depends, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import HTMLResponse, JSONResponse
from dotenv import load_dotenv
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

from lime_inference import VeriVoxLimeAnalyzer

logger = logging.getLogger("verivox_api")
logging.basicConfig(level=logging.INFO)

API_SECRET_KEY_ENV = "API_SECRET_KEY"
DEFAULT_MAX_UPLOAD_BYTES = 0
UPLOAD_CHUNK_SIZE = 1024 * 1024


BASE_ERROR_RESPONSE = {
    "spoof_score": None,
    "bonafide_score": None,
    "predicted_label": "error",
    "confidence": "0.00%",
    "confidence_level": "low",
    "is_uncertain": True,
    "warning": None,
}


def error_response(status_code: int, message: str, upload_debug: Optional[dict] = None) -> JSONResponse:
    response = {
        **BASE_ERROR_RESPONSE,
        "warning": message,
    }
    if os.getenv("INCLUDE_DEBUG_META", "true").lower() in ("1", "true", "yes"):
        response["debug"] = upload_debug or {}
    return JSONResponse(status_code=status_code, content=response)


def parse_percent(value) -> Optional[float]:
    if value is None:
        return None
    try:
        return float(str(value).strip().rstrip("%")) / 100.0
    except (TypeError, ValueError):
        return None


def build_confidence_fields(result: dict) -> dict:
    confidence = result.get("confidence")
    confidence_level = result.get("confidence_level")
    is_uncertain = result.get("is_uncertain")
    warning = result.get("warning")

    if confidence_level is not None:
        return {
            "confidence": confidence,
            "confidence_level": confidence_level,
            "is_uncertain": is_uncertain,
            "warning": warning,
        }

    spoof_prob = parse_percent(result.get("spoof_score"))
    bonafide_prob = parse_percent(result.get("bonafide_score"))
    if spoof_prob is None or bonafide_prob is None:
        audio_debug = result.get("audio_debug") or {}
        spoof_prob = audio_debug.get("prob_spoof_class_0")
        bonafide_prob = audio_debug.get("prob_bonafide_class_1")

    if spoof_prob is None or bonafide_prob is None:
        return {
            "confidence": None,
            "confidence_level": None,
            "is_uncertain": None,
            "warning": None,
        }

    max_prob = max(float(spoof_prob), float(bonafide_prob))
    low_threshold = float(os.getenv("CONFIDENCE_THRESHOLD", "0.60"))
    medium_threshold = float(os.getenv("MEDIUM_CONFIDENCE_THRESHOLD", "0.75"))
    if max_prob < low_threshold:
        level = "low"
    elif max_prob < medium_threshold:
        level = "medium"
    else:
        level = "high"

    generated_warning = warning
    if level == "low":
        generated_warning = (
            "Low-confidence prediction near the model decision boundary. Treat this as inconclusive, "
            "especially for in-the-wild mic, WhatsApp, radio, noisy, or long-form recordings."
        )

    return {
        "confidence": f"{max_prob * 100:.2f}%",
        "confidence_level": level,
        "is_uncertain": level == "low",
        "warning": generated_warning,
    }


def create_lime_image_base64(raw_audio: np.ndarray, sr: int, lime_weights: Dict[int, float], num_chunks: int, actual_seconds: float) -> str:
    """
    Create a waveform plot with LIME-weighted segments overlaid and return a data URI Base64 PNG string.
    """
    # Time axis in seconds for the provided raw_audio
    samples = raw_audio.shape[0]
    times = np.linspace(0, actual_seconds, samples)

    fig, ax = plt.subplots(figsize=(10, 3), constrained_layout=True)
    ax.plot(times, raw_audio, color="#444444", linewidth=0.7)
    ax.set_xlim(0, actual_seconds)
    # avoid degenerate y-limits
    ymin = np.min(raw_audio) if samples > 0 else -1.0
    ymax = np.max(raw_audio) if samples > 0 else 1.0
    if ymin == ymax:
        ymin -= 1e-6
        ymax += 1e-6
    ax.set_ylim(ymin * 1.05, ymax * 1.05)
    ax.set_xlabel("Time (s)")
    ax.set_ylabel("Amplitude")

    # Normalize weights for coloring
    if not lime_weights:
        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=150)
        plt.close(fig)
        buf.seek(0)
        img_b64 = base64.b64encode(buf.read()).decode('ascii')
        return f"data:image/png;base64,{img_b64}"

    weights = np.array([v for k, v in sorted(lime_weights.items())])
    max_abs = np.max(np.abs(weights)) if np.max(np.abs(weights)) != 0 else 1.0

    # Colors: positive weights -> red, negative -> blue. Intensity scaled by relative magnitude.
    for idx in range(num_chunks):
        start_sec = idx * (actual_seconds / num_chunks)
        end_sec = (idx + 1) * (actual_seconds / num_chunks)
        w = float(lime_weights.get(idx, 0.0))
        if w == 0.0:
            continue
        intensity = min(abs(w) / max_abs, 1.0)
        if w > 0:
            color = (1.0, 1.0 - intensity, 1.0 - intensity)  # red-ish
        else:
            color = (1.0 - intensity, 1.0 - intensity, 1.0)  # blue-ish
        ax.axvspan(start_sec, end_sec, color=color, alpha=0.45)

    # Render to PNG base64
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150)
    plt.close(fig)
    buf.seek(0)
    img_b64 = base64.b64encode(buf.read()).decode('ascii')
    return f"data:image/png;base64,{img_b64}"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load env vars from .env at project root
    load_dotenv()
    groq_api_key = os.getenv("GROQ_API_KEY")
    app.state.api_secret_key = os.getenv(API_SECRET_KEY_ENV)
    config_path = os.getenv("CONFIG_PATH", "config/AASIST.conf")
    device = os.getenv("MODEL_DEVICE", "cpu")

    if groq_api_key is None:
        logger.warning("GROQ_API_KEY not set in environment; Groq requests may fail.")
    if app.state.api_secret_key is None:
        logger.warning("API_SECRET_KEY not set in environment; /analyze will reject all requests.")

    # Instantiate analyzer and keep it globally
    try:
        app.state.analyzer = VeriVoxLimeAnalyzer(config_path, device=device, groq_api_key=groq_api_key)
        logger.info("VeriVoxLimeAnalyzer loaded successfully.")
    except Exception as e:
        logger.exception("Failed to initialize VeriVoxLimeAnalyzer: %s", e)
        # Reraise so the app won't start silently broken
        raise

    yield


app = FastAPI(title="VeriVox LIME Analyzer API", lifespan=lifespan)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return error_response(exc.status_code, str(exc.detail))


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return error_response(422, "Invalid request. Ensure multipart field 'file' and X-API-Key are provided.")


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled API exception: %s", exc)
    return error_response(500, "Unexpected server error. Treat this result as uncertain.")


@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>VeriVox API</title>
        <style>
          body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f7f8fb;
            color: #18202f;
          }
          main {
            max-width: 760px;
            margin: 64px auto;
            padding: 0 24px;
          }
          section {
            background: #ffffff;
            border: 1px solid #d9deea;
            border-radius: 8px;
            padding: 28px;
          }
          h1 {
            margin: 0 0 12px;
            font-size: 30px;
          }
          p {
            line-height: 1.55;
          }
          code {
            background: #eef1f7;
            border-radius: 4px;
            padding: 2px 6px;
          }
          a {
            color: #2157c7;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <main>
          <section>
            <h1>VeriVox API is running</h1>
            <p>
              This Hugging Face Space hosts the VeriVox audio anti-spoofing backend.
              The analysis endpoint is a secured API route, not a browser form.
            </p>
            <p>
              Health check: <a href="/healthz"><code>GET /healthz</code></a><br />
              API docs: <a href="/docs"><code>GET /docs</code></a><br />
              Fast prediction: <code>POST /predict</code> with multipart field <code>file</code>
              and header <code>X-API-Key</code>.<br />
              Explanation: <code>POST /analyze</code> runs slower LIME diagnostics for the selected window.
            </p>
          </section>
        </main>
      </body>
    </html>
    """


@app.get("/healthz")
async def healthz():
    return {"status": "ok", "analyzer_loaded": hasattr(app.state, "analyzer")}


async def save_upload_to_temp(file: UploadFile) -> tuple[str, dict]:
    if not file.filename or not file.filename.lower().endswith(('.wav', '.flac', '.mp3', '.m4a', '.webm', '.ogg')):
        raise HTTPException(status_code=400, detail="Unsupported file type. Use WAV/FLAC/MP3/M4A/WEBM/OGG.")

    upload_debug = {
        "filename": file.filename,
        "content_type": file.content_type,
    }

    tmp_path = None
    try:
        suffix = os.path.splitext(file.filename)[1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp_path = tmp.name
            upload_size = 0
            max_upload_bytes = int(os.getenv("MAX_UPLOAD_BYTES", str(DEFAULT_MAX_UPLOAD_BYTES)))

            while True:
                chunk = await file.read(UPLOAD_CHUNK_SIZE)
                if not chunk:
                    break
                upload_size += len(chunk)
                if max_upload_bytes > 0 and upload_size > max_upload_bytes:
                    upload_debug["upload_size_bytes"] = upload_size
                    logger.warning("Rejected oversized upload: %s max=%s", upload_debug, max_upload_bytes)
                    raise HTTPException(
                        status_code=413,
                        detail=f"Uploaded file is too large. Maximum allowed size is {max_upload_bytes} bytes.",
                    )
                tmp.write(chunk)

            upload_debug["upload_size_bytes"] = upload_size

            if upload_size == 0:
                logger.warning("Rejected empty upload: %s", upload_debug)
                raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        upload_debug["temp_file_size_bytes"] = os.path.getsize(tmp_path)
        logger.info("Received audio upload: %s", upload_debug)
        return tmp_path, upload_debug
    except HTTPException:
        if tmp_path:
            try:
                os.remove(tmp_path)
            except OSError:
                pass
        raise
    except Exception as e:
        if tmp_path:
            try:
                os.remove(tmp_path)
            except OSError:
                pass
        logger.exception("Failed to save uploaded file: %s", e)
        raise HTTPException(status_code=500, detail="Failed to process uploaded file.")


async def run_analyzer_job(job_fn, tmp_path: str, upload_debug: dict):
    loop = asyncio.get_running_loop()
    try:
        return await loop.run_in_executor(None, job_fn, tmp_path)
    except ValueError as e:
        logger.warning("Analysis rejected uploaded audio: %s upload=%s", e, upload_debug)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Analysis failed: %s", e)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")
    finally:
        try:
            os.remove(tmp_path)
        except Exception:
            pass


def verify_api_key(x_api_key: Optional[str] = Header(default=None, alias="X-API-Key")) -> None:
    expected_key = getattr(app.state, "api_secret_key", None)
    if not expected_key or not x_api_key or not secrets.compare_digest(x_api_key, expected_key):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")


@app.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    _auth: None = Depends(verify_api_key),
):
    upload_debug = {}
    try:
        tmp_path, upload_debug = await save_upload_to_temp(file)
        analyzer: VeriVoxLimeAnalyzer = app.state.analyzer
        result = await run_analyzer_job(analyzer.analyze, tmp_path, upload_debug)
    except HTTPException as e:
        return error_response(e.status_code, str(e.detail), upload_debug)
    except Exception as e:
        logger.exception("Unhandled /analyze failure: %s", e)
        return error_response(500, "Analysis failed unexpectedly. Treat this result as uncertain.", upload_debug)

    # Build base64 LIME image from raw_audio and weights
    raw_audio = result.get("raw_audio")
    lime_weights = result.get("lime_weights", {})
    num_chunks = int(result.get("num_chunks", 50))
    actual_seconds = float(result.get("actual_seconds", 4.0375))

    # Ensure raw_audio is numpy array
    raw_audio = np.array(raw_audio)
    confidence_fields = build_confidence_fields(result)

    try:
        lime_graph_b64 = create_lime_image_base64(raw_audio, 16000, lime_weights, num_chunks, actual_seconds)
    except Exception as e:
        logger.exception("Failed to create LIME graph: %s", e)
        lime_graph_b64 = ""

    response = {
        "spoof_score": result.get("spoof_score"),
        "bonafide_score": result.get("bonafide_score"),
        "predicted_label": result.get("predicted_label"),
        **confidence_fields,
        "text_description": result.get("text_description"),
        "lime_graph_base64": lime_graph_b64
    }
    if any(response.get(key) is None for key in ("spoof_score", "bonafide_score", "predicted_label", "is_uncertain")):
        logger.error("Analyzer returned incomplete /analyze response: %s", response)
        return error_response(500, "Analysis returned incomplete model output. Treat this result as uncertain.", upload_debug)

    if os.getenv("INCLUDE_DEBUG_META", "true").lower() in ("1", "true", "yes"):
        response["debug"] = {
            **upload_debug,
            "audio": result.get("audio_debug", {}),
            "num_chunks": result.get("num_chunks"),
            "num_samples_used": result.get("num_samples_used"),
        }

    return JSONResponse(content=response)


@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    _auth: None = Depends(verify_api_key),
):
    upload_debug = {}
    try:
        tmp_path, upload_debug = await save_upload_to_temp(file)
        analyzer: VeriVoxLimeAnalyzer = app.state.analyzer
        result = await run_analyzer_job(analyzer.predict, tmp_path, upload_debug)
    except HTTPException as e:
        return error_response(e.status_code, str(e.detail), upload_debug)
    except Exception as e:
        logger.exception("Unhandled /predict failure: %s", e)
        return error_response(500, "Prediction failed unexpectedly. Treat this result as uncertain.", upload_debug)

    confidence_fields = build_confidence_fields(result)

    response = {
        "spoof_score": result.get("spoof_score"),
        "bonafide_score": result.get("bonafide_score"),
        "predicted_label": result.get("predicted_label"),
        **confidence_fields,
    }
    if any(response.get(key) is None for key in ("spoof_score", "bonafide_score", "predicted_label", "is_uncertain")):
        logger.error("Analyzer returned incomplete /predict response: %s", response)
        return error_response(500, "Prediction returned incomplete model output. Treat this result as uncertain.", upload_debug)

    if os.getenv("INCLUDE_DEBUG_META", "true").lower() in ("1", "true", "yes"):
        response["debug"] = {
            **upload_debug,
            "audio": result.get("audio_debug", {}),
        }

    return JSONResponse(content=response)
