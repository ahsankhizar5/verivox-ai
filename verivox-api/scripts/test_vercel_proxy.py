import argparse
import base64
import json
from pathlib import Path

import requests


def strip_data_uri(image_value: str) -> str:
    if image_value.startswith("data:image") and "," in image_value:
        return image_value.split(",", 1)[1]
    return image_value


def main() -> int:
    parser = argparse.ArgumentParser(description="Test a deployed Vercel /api/analyze proxy route.")
    parser.add_argument("--url", required=True, help="Vercel proxy URL, for example https://app.vercel.app/api/analyze")
    parser.add_argument("--audio", default="sample.wav", help="Path to the input audio file")
    parser.add_argument("--out", default="vercel_lime_graph.png", help="Where to save the returned PNG")
    parser.add_argument("--timeout", type=int, default=900, help="HTTP timeout in seconds")
    args = parser.parse_args()

    audio_path = Path(args.audio)
    if not audio_path.exists():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    with audio_path.open("rb") as audio_file:
        files = {"file": (audio_path.name, audio_file, "audio/wav")}
        response = requests.post(args.url, files=files, timeout=args.timeout)

    print(f"status: {response.status_code}")
    response.raise_for_status()

    payload = response.json()
    print("keys:", sorted(payload.keys()))
    print("spoof_score:", payload.get("spoof_score"))
    print("description_len:", len(payload.get("text_description") or ""))

    image_value = payload.get("lime_graph_base64", "")
    print("image_prefix:", image_value[:22])
    print("image_len:", len(image_value))

    if image_value:
        out_path = Path(args.out)
        out_path.write_bytes(base64.b64decode(strip_data_uri(image_value)))
        print(f"saved_graph: {out_path.resolve()}")

    print(json.dumps({"proxy_ok": True}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
