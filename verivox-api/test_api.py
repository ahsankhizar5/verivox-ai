"""
Simple client for VeriVox API.

Usage:
  python test_api.py --audio sample.wav --api-key YOUR_API_SECRET_KEY

It sends the file to /analyze, prints the JSON response, and writes the returned
Base64 LIME graph to lime_graph.png (or a custom output path).
"""

import argparse
import base64
import json
import os
from pathlib import Path

import requests


def _strip_data_uri(image_value: str) -> str:
    if image_value.startswith("data:image") and "," in image_value:
        return image_value.split(",", 1)[1]
    return image_value


def main() -> int:
    parser = argparse.ArgumentParser(description="Call VeriVox /analyze and save the returned graph.")
    parser.add_argument("--audio", default="sample.wav", help="Path to the input audio file")
    parser.add_argument("--api-key", required=True, help="Value for the X-API-Key header")
    parser.add_argument("--url", default="http://localhost:8000/analyze", help="API endpoint URL")
    parser.add_argument("--out", default="lime_graph.png", help="Where to save the returned PNG")
    parser.add_argument("--timeout", type=int, default=int(os.getenv("API_TIMEOUT_SECONDS", "900")), help="HTTP timeout in seconds")
    args = parser.parse_args()

    audio_path = Path(args.audio)
    if not audio_path.exists():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    headers = {"X-API-Key": args.api_key}
    with audio_path.open("rb") as audio_file:
        files = {"file": (audio_path.name, audio_file, "audio/wav")}
        response = requests.post(args.url, files=files, headers=headers, timeout=args.timeout)

    response.raise_for_status()
    payload = response.json()

    print(json.dumps(payload, indent=2))

    image_value = payload.get("lime_graph_base64", "")
    if image_value:
        png_bytes = base64.b64decode(_strip_data_uri(image_value))
        out_path = Path(args.out)
        out_path.write_bytes(png_bytes)
        print(f"Saved LIME graph to {out_path.resolve()}")
    else:
        print("No lime_graph_base64 value was returned.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
