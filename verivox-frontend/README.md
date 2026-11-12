# VeriVox Studio — Web Platform, LIME XAI Scanner & Enterprise API

<div align="center">

[![Live Studio](https://img.shields.io/badge/Live_Platform-www.verivox.studio-F59E0B?style=for-the-badge&logo=vercel&logoColor=0B0A09)](https://www.verivox.studio)
[![Enterprise REST API](https://img.shields.io/badge/Enterprise_API-%2Fapi%2Fv1%2Fverify-10B981?style=for-the-badge)](https://www.verivox.studio/enterprise)
[![Research Architecture](https://img.shields.io/badge/Research_Pipeline-%2Fresearch-F59E0B?style=for-the-badge)](https://www.verivox.studio/research)
[![Android APK](https://img.shields.io/badge/Android_APK-v1.0.0_(2.32_MB)-10B981?style=for-the-badge&logo=android&logoColor=white)](https://www.verivox.studio/VeriVox.apk)
[![Browser Extension](https://img.shields.io/badge/Chrome_&_Edge_Extension-Manifest_V3-F59E0B?style=for-the-badge&logo=googlechrome&logoColor=0B0A09)](https://www.verivox.studio/VeriVox-Extension.zip)

**Real-time voice deepfake detection, screen/speaker replay forensics, and LIME Explainable AI (XAI) with instant A4 PDF certification.**

</div>

---

## Key Capabilities

- **Live Microphone & File Forensics (`/#scanner`)**: Record live voice in-browser or upload `.wav`, `.mp3`, `.flac`, `.m4a`, or `.webm` files for sub-second verification.
- **3-Class Acoustic Classification**: Distinguishes between **Human Live Voice**, **AI Voice Clone / TTS**, and **Screen / Speaker Replay**.
- **LIME Explainable AI (XAI)**: Generates an 8-window temporal attribution chart (`0.0s–3.2s`) and 3-band spectral impact analysis (`80–320 Hz F0`, `320–3200 Hz Formants`, `3200–8000 Hz Vocoder Band`).
- **Cryptographic A4 PDF Certificate**: Client-side vector PDF generator embedding the SHA-256 file fingerprint, 6 biometric cards, 8-bar LIME temporal chart, and 3-band spectral table.
- **Enterprise API Gateway (`/enterprise` & `/api/v1/verify`)**: Instant API key provisioning, interactive sandbox tester, and copy-paste `cURL`, `Python`, and `Node.js` snippets.
- **1-Click Judge Demo Access (`/login`)**: Instant authenticated dashboard access (`demo@verivox.studio` / `VeriVox2026!`) with full scan history and unlocked Enterprise API keys.

---

## Route & Endpoint Map

| Route / Endpoint | Description |
| :--- | :--- |
| `/` | Executive Landing Page + Interactive Live Voice Forensics Studio |
| `/enterprise` | Enterprise API Gateway, Live Sandbox Tester, Key Generator & Client Downloads |
| `/research` | 4-Stage Acoustic Architecture (`DSP` + `Wav2Vec2-XLSR` + `AASIST` + `LIME XAI`) |
| `/login` & `/signup` | Authentication Portal with **1-Click Judge Demo Login** |
| `/dashboard` | Authenticated Forensic History, Analytics & Enterprise API Console |
| `POST /api/live-scan` | Primary multi-model acoustic scanner returning biometrics + LIME XAI |
| `GET/POST /api/v1/verify` | Public Enterprise REST API endpoint (`multipart/form-data` & `application/json`) |
| `/VeriVox.apk` | Direct download for the native Android APK (`2.32 MB`) |
| `/VeriVox-Extension.zip` | Direct download for the Chrome & Edge Manifest V3 Browser Extension |

---

## Local Development

```bash
npm install
npm run dev
```

Build for production:
```bash
npm run build
npm start
```
