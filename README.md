# VeriVox AI — Real-Time Voice Clone, Mimicry & Deepfake Detection Platform

**Live Web Platform:** [verivox.tech](https://verivox.tech) | [verivox-kappa.vercel.app](https://verivox-kappa.vercel.app)  
**Download Android APK:** [Download VeriVox.apk (Latest Release)](https://github.com/ahsankhizar5/verivox-ai/releases/latest/download/VeriVox.apk)

---

## Overview

**VeriVox AI** is a full-stack voice authenticity and deepfake detection platform built for real-time verification across **Live Microphone**, **Screen / System Audio**, and **Uploaded Audio Recordings**.

Unlike legacy detectors limited to studio benchmark datasets, VeriVox uses a **Multi-Model Ensemble** combining:
1. **Wav2Vec2 Self-Supervised Transformer (`MelodyMachine/Deepfake-audio-detection-V2`)** for generalized detection of unseen zero-shot TTS and commercial AI voice clones (ElevenLabs, OpenAI, XTTS).
2. **AASIST Spectro-Temporal Graph Attention Network** for fine-grained vocoder phase and spectral artifact detection.
3. **Live Vocal Cord Biometrics (16 kHz PCM DSP)** measuring fundamental pitch micro-jitter, plosive crest factor, and syllable energy modulation to accurately verify live human microphone recordings and voice mimicry (RVC / SVC).
4. **LIME Time-Segment Explainability & A4 PDF Reporting** to highlight exact synthetic audio segments.

---

## Repository Structure

| Directory | Description |
| :--- | :--- |
| [`verivox-frontend/`](./verivox-frontend) | Next.js 14 Web & PWA application featuring the **Real-Time Voice Scanner Studio** (Live Mic, Screen/Tab Audio Capture, File Upload), Emerald/Violet/Coral Dark Slate UI, LIME heatmaps, and instant A4 PDF export. |
| [`verivox-api/`](./verivox-api) | FastAPI Docker backend combining **Wav2Vec2 + AASIST + LIME XAI + Groq LLM** forensic synthesis. |
| [`android-app/`](./android-app) | Native Android (`tech.verivox.app`) application with hardware-accelerated WebRTC microphone recording and audio file picker, compiled automatically via GitHub Actions. |
| [`.github/workflows/build-apk.yml`](./.github/workflows/build-apk.yml) | Automated CI/CD pipeline that builds `VeriVox.apk` with JDK 17 + Gradle 8.5 and publishes it to GitHub Releases. |

---

## Real-Time Capabilities

- **Live Microphone Recording:** Record directly in the browser or Android app; automatically resamples to 16 kHz Mono 16-bit PCM WAV and verifies human vocal cord micro-jitter in ~2 seconds.
- **Screen & Browser Tab Audio Capture:** Capture system audio directly from YouTube, WhatsApp Web, TikTok, or video calls to detect synthetic speech in real time.
- **Unseen File Verification:** Supports `.wav`, `.mp3`, `.flac`, `.m4a`, `.webm`, and `.ogg` up to 15 MB.
- **Source Profile Classification:** Distinguishes between *Authentic Live Microphone Speech*, *AI Voice Clone / Neural TTS*, *Voice Mimicry / RVC Conversion*, and *Screen / System Audio*.
