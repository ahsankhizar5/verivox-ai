# VeriVox Studio — Real-Time Voice Authenticity & LIME XAI Forensics

<div align="center">

[![Live Studio](https://img.shields.io/badge/Live_Platform-www.verivox.studio-F59E0B?style=for-the-badge&logo=vercel&logoColor=0B0A09)](https://www.verivox.studio)
[![Enterprise REST API](https://img.shields.io/badge/Enterprise_API-%2Fapi%2Fv1%2Fverify-10B981?style=for-the-badge)](https://www.verivox.studio/enterprise)
[![Research Architecture](https://img.shields.io/badge/Research_Pipeline-%2Fresearch-F59E0B?style=for-the-badge)](https://www.verivox.studio/research)
[![Android APK](https://img.shields.io/badge/Android_APK-v1.0.0_(2.32_MB)-10B981?style=for-the-badge&logo=android&logoColor=white)](https://www.verivox.studio/VeriVox-Native-v2.2.apk)
[![Browser Extension](https://img.shields.io/badge/Chrome_&_Edge_Extension-Manifest_V3-F59E0B?style=for-the-badge&logo=googlechrome&logoColor=0B0A09)](https://www.verivox.studio/VeriVox-Extension.zip)

**Zero-shot voice clone detection, screen/speaker replay forensics, and LIME Explainable AI (XAI) across Web, REST API, Browser Extension, and Android.**

[Launch Live Scanner](https://www.verivox.studio/#scanner) · [Enterprise API Gateway](https://www.verivox.studio/enterprise) · [Research & Architecture](https://www.verivox.studio/research) · [Download Android APK](https://www.verivox.studio/VeriVox-Native-v2.2.apk) · [Download Browser Extension](https://www.verivox.studio/VeriVox-Extension.zip)

</div>

---

## Overview

**VeriVox Studio** is an end-to-end voice authenticity and acoustic forensics platform designed to detect:
1. **Bona Fide Human Speech** — Live vocal-tract recordings with natural micro-jitter, shimmer, and harmonic-to-noise dynamics.
2. **AI Voice Clones & Neural TTS** — Unseen zero-shot neural speech generators (ElevenLabs, XTTS, VALL-E, OpenAI Voice, Bark) exhibiting over-smoothed pitch contours and vocoder phase periodicity.
3. **Physical Replay & Screen Audio** — Re-broadcast recordings played through phone speakers or secondary transducers showing sub-bass roll-off (<120 Hz) and room impulse response (RIR) comb-filtering.

Every scan produces an interactive **LIME Explainable AI (XAI)** breakdown—highlighting exact 400 ms temporal windows and 3-band spectral attribution—and exports a **SHA-256 hashed A4 Forensic PDF Certificate**.

---

## Multi-Stage Acoustic Architecture

```
16 kHz PCM Stream ──► Stage 01: Glottal & Spectral Biometrics (F0 Jitter, Shimmer, HNR, Crest Factor)
                  ──► Stage 02: Self-Supervised Acoustic Transformer (Wav2Vec2-Large-XLSR, 96M Params)
                  ──► Stage 03: Spectro-Temporal Graph Attention (AASIST Heterogeneous Graph Pooling)
                  ──► Stage 04: LIME Explainable AI (8-Window Temporal + 3-Band Spectral Attribution)
```

| Stage | Module | Primary Role | Key Acoustic Indicators |
| :--- | :--- | :--- | :--- |
| **01** | **16 kHz DSP & Glottal Biometrics** | Zero-shot physical & vocal-tract profiling | F0 Pitch Jitter (%), Amplitude Shimmer (dB), Harmonic-to-Noise Ratio (HNR), Dynamic Crest Factor |
| **02** | **Wav2Vec2-Large-XLSR** | 1024-D contextual frame representations | Captures subtle neural vocoder phase discontinuities on unseen TTS generators |
| **03** | **AASIST Graph Attention** | Spectro-temporal heterogeneous graph fusion | Models joint time-frequency artifacts across ASVspoof 2019 Logical Access benchmarks |
| **04** | **LIME XAI Engine** | Temporal & spectral attribution + A4 PDF | 8 temporal segments (`0.0s–3.2s`) and 3 frequency bands (`80–320 Hz`, `320–3200 Hz`, `3.2–8.0 kHz`) |

---

## Ecosystem & Repository Structure

```
Verivox/
├── verivox-frontend/          # Next.js 14 Web Studio, Live Scanner, LIME XAI PDF Exporter & REST API
│   ├── src/app/page.tsx       # Executive Landing Page & Live Interactive Scanner
│   ├── src/app/enterprise/    # Public Enterprise API Sandbox, Key Generator & SDK Docs
│   ├── src/app/research/      # 4-Stage Acoustic Research & Benchmark Documentation
│   ├── src/app/dashboard/     # Authenticated Forensic History, Analytics & API Key Console
│   ├── src/app/api/live-scan/ # Multi-Model Acoustic Inference + LIME XAI Engine
│   ├── src/app/api/v1/verify/ # Public Enterprise REST API Endpoint (Multipart & JSON)
│   └── public/                # Direct downloads: VeriVox.apk & VeriVox-Extension.zip
├── chrome-extension/          # Chrome & Edge Manifest V3 Browser Extension
│   ├── manifest.json          # Manifest V3 configuration
│   ├── popup.html             # Obsidian & Warm Gold extension UI
│   └── popup.js               # Live Mic capture + File upload + LIME XAI bar renderer
├── android-app/               # Native Android APK Project (Gradle / WebView + Hardware Mic Bridge)
└── verivox/                   # FastAPI Python Backend & AASIST / LIME PyTorch Inference Weights
```

---

## Enterprise REST API (`/api/v1/verify`)

VeriVox provides a production-ready REST endpoint at `https://www.verivox.studio/api/v1/verify` supporting both `multipart/form-data` audio file uploads and JSON verification requests.

### 1. Verify an Audio File (`multipart/form-data`)

```bash
curl -X POST https://www.verivox.studio/api/v1/verify \
  -H "Authorization: Bearer vvx_live_demo_enterprise_2026" \
  -F "file=@sample_voice.wav"
```

### 2. Verify via JSON Sandbox Payload

```bash
curl -X POST https://www.verivox.studio/api/v1/verify \
  -H "Authorization: Bearer vvx_live_demo_enterprise_2026" \
  -H "Content-Type: application/json" \
  -d '{"sampleType": "ai_clone"}'
```

### Sample JSON Response

```json
{
  "requestId": "vvx_req_8bc762356b0f",
  "timestamp": "2026-11-13T01:30:00.000Z",
  "apiVersion": "2026-11.v1",
  "verdict": {
    "classification": "AI_VOICE_CLONE",
    "label": "AI Voice Clone / TTS",
    "authentic": false,
    "confidence": 96.4,
    "riskScore": 0.942
  },
  "biometrics": {
    "pitchStdHz": 6.4,
    "jitterPct": 0.31,
    "shimmerDb": 0.19,
    "hnrDb": 28.4,
    "highFreqRatioPct": 11.2,
    "crestFactor": 3.41
  },
  "xaiExplainability": {
    "method": "LIME Spectro-Temporal Attribution (8-Window)",
    "temporalSegments": [
      { "window": "0.0s-0.4s", "syntheticWeight": 88, "reason": "Neural vocoder pitch lock" },
      { "window": "0.4s-0.8s", "syntheticWeight": 94, "reason": "Phase periodicity artifact" }
    ],
    "frequencyBands": [
      { "band": "80-320 Hz (Fundamental F0)", "impact": 91, "status": "Over-smoothed pitch contour" },
      { "band": "320-3200 Hz (Formants F1-F3)", "impact": 84, "status": "Missing glottal micro-shimmer" },
      { "band": "3200-8000 Hz (Vocoder Band)", "impact": 96, "status": "HiFi-GAN phase periodicity" }
    ]
  }
}
```

---

## Quick Start (Local Development)

### 1. Web Platform & API (`verivox-frontend`)

```bash
cd verivox-frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.
- **Live Scanner:** `http://localhost:3000/#scanner`
- **Enterprise API Hub:** `http://localhost:3000/enterprise`
- **Research & Architecture:** `http://localhost:3000/research`
- **1-Click Judge Demo Login:** Visit `http://localhost:3000/login` and click **1-Click Judge Demo Login** (`demo@verivox.studio` / `VeriVox2026!`).

### 2. Chrome & Edge Browser Extension (`chrome-extension`)

1. Download [`VeriVox-Extension.zip`](https://www.verivox.studio/VeriVox-Extension.zip) or use the `chrome-extension/` folder directly.
2. Open `chrome://extensions` (or `edge://extensions`) and enable **Developer mode**.
3. Click **Load unpacked** and select the `chrome-extension/` directory.
4. Click the **VeriVox AI Voice Shield** icon in your browser toolbar to record live microphone audio or verify audio files directly in the popup.

### 3. Android APK (`android-app`)

- **Direct Install:** Download [`https://www.verivox.studio/VeriVox-Native-v2.2.apk`](https://www.verivox.studio/VeriVox-Native-v2.2.apk) (`2.39 MB`, signed Android universal APK).
- **Build from Source:**
  ```bash
  cd android-app
  ./gradlew assembleRelease
  ```

---

## License & Attribution

Developed by the **VeriVox Studio Engineering Team** (2026). Built with Next.js 14, Tailwind CSS, Web Audio DSP, PyTorch (`Wav2Vec2-XLSR` + `AASIST`), and LIME Explainable AI.
