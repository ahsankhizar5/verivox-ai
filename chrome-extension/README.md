# VeriVox AI Voice Shield — Chrome & Edge Extension (Manifest V3)

Real-time browser extension for **VeriVox Studio** (`https://www.verivox.studio`) in the **Obsidian & Warm Gold** theme.

## Features
- **Live Microphone Recording**: Capture 4-second 16 kHz mono WAV audio directly inside the browser toolbar popup and run instant voice authenticity analysis.
- **Audio File Verification**: Upload any `.wav`, `.mp3`, `.flac`, `.m4a`, or `.ogg` file for immediate deepfake and replay detection.
- **LIME XAI Attribution**: Visualizes the 8-window LIME temporal attribution chart and biometric metrics (`F0 Jitter`, `HNR`, `Crest Factor`, `Spectral Roll`) directly inside the extension popup.

## Installation (Developer Mode)
1. Download and unzip [`VeriVox-Extension.zip`](https://www.verivox.studio/VeriVox-Extension.zip) (or select this `chrome-extension/` folder).
2. Open `chrome://extensions` in Google Chrome or `edge://extensions` in Microsoft Edge.
3. Toggle **Developer mode** ON in the top-right corner.
4. Click **Load unpacked** and select the `chrome-extension` folder.
5. Pin **VeriVox AI Voice Shield** to your toolbar and click it to scan live voice or audio files.
