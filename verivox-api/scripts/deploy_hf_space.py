import argparse
import os
from pathlib import Path


REQUIRED_UPLOADS = [
    "Dockerfile",
    ".dockerignore",
    ".env.example",
    "README.md",
    "DEPLOYMENT.md",
    "requirements.txt",
    "requirements-deploy.txt",
    "verivox_api.py",
    "lime_inference.py",
    "test_api.py",
    "scripts/deploy_hf_space.py",
    "scripts/deploy_hf_space.ps1",
    "scripts/smoke_docker.ps1",
    "scripts/test_vercel_proxy.py",
    "examples/vercel-proxy/.env.example",
    "examples/vercel-proxy/README.md",
    "examples/vercel-proxy/app/layout.tsx",
    "examples/vercel-proxy/app/page.tsx",
    "examples/vercel-proxy/app/api/analyze/route.ts",
    "examples/vercel-proxy/next.config.ts",
    "examples/vercel-proxy/package.json",
    "examples/vercel-proxy/tsconfig.json",
    "models/AASIST.py",
    "models/__init__.py",
    "config/AASIST.conf",
    "config/best.pth",
]

SPACE_SECRET_KEYS = [
    "GROQ_API_KEY",
    "API_SECRET_KEY",
    "CONFIG_PATH",
    "MODEL_DEVICE",
    "LIME_NUM_CHUNKS",
    "LIME_NUM_SAMPLES",
    "MAX_PREDICT_WINDOWS",
    "PREDICT_TOP_K",
    "CM_SCORE_THRESHOLD",
    "CM_SCORE_SCALE",
    "CONFIDENCE_THRESHOLD",
    "MEDIUM_CONFIDENCE_THRESHOLD",
    "FLAT_WINDOW_SPREAD_THRESHOLD",
    "MAX_UPLOAD_BYTES",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create/update the VeriVox Hugging Face Docker Space.")
    parser.add_argument(
        "--repo-id",
        default=os.getenv("HF_SPACE_ID"),
        help="Hugging Face Space id, for example username/verivox-api. Defaults to HF_SPACE_ID.",
    )
    parser.add_argument(
        "--token",
        default=os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_HUB_TOKEN"),
        help="Hugging Face token. Defaults to HF_TOKEN or HUGGINGFACE_HUB_TOKEN.",
    )
    parser.add_argument(
        "--public",
        action="store_true",
        help="Create the Space as public. Default is private.",
    )
    parser.add_argument(
        "--skip-secrets",
        action="store_true",
        help="Do not set Hugging Face Space secrets from local .env/environment.",
    )
    return parser.parse_args()


def assert_required_files(root: Path) -> None:
    missing = [path for path in REQUIRED_UPLOADS if not (root / path).exists()]
    if missing:
        missing_list = "\n".join(f"- {path}" for path in missing)
        raise SystemExit(f"Missing required upload files:\n{missing_list}")


def load_dotenv_values(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values

    for line in path.read_text().splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or "=" not in stripped:
            continue
        key, value = stripped.split("=", 1)
        values[key.strip()] = value.strip().strip('"').strip("'")

    return values


def collect_space_secrets(root: Path) -> dict[str, str]:
    dotenv_values = load_dotenv_values(root / ".env")
    secrets: dict[str, str] = {}

    for key in SPACE_SECRET_KEYS:
        value = os.getenv(key) or dotenv_values.get(key)
        if value:
            secrets[key] = value

    secrets.setdefault("CONFIG_PATH", "config/AASIST.conf")
    secrets.setdefault("MODEL_DEVICE", "cpu")
    secrets.setdefault("LIME_NUM_CHUNKS", "20")
    secrets.setdefault("LIME_NUM_SAMPLES", "20")
    secrets.setdefault("MAX_PREDICT_WINDOWS", "2")
    secrets.setdefault("PREDICT_TOP_K", "3")
    secrets.setdefault("CM_SCORE_THRESHOLD", "2.2389912605285645")
    secrets.setdefault("CM_SCORE_SCALE", "1.0")
    secrets.setdefault("CONFIDENCE_THRESHOLD", "0.60")
    secrets.setdefault("MEDIUM_CONFIDENCE_THRESHOLD", "0.75")
    secrets.setdefault("FLAT_WINDOW_SPREAD_THRESHOLD", "0.02")
    return secrets


def main() -> int:
    args = parse_args()
    if not args.repo_id:
        raise SystemExit("Missing --repo-id or HF_SPACE_ID, for example: username/verivox-api")
    if not args.token:
        raise SystemExit("Missing --token, HF_TOKEN, or HUGGINGFACE_HUB_TOKEN.")

    root = Path(__file__).resolve().parents[1]
    assert_required_files(root)

    try:
        from huggingface_hub import HfApi
    except ImportError as exc:
        raise SystemExit(
            "Missing huggingface_hub. Install deployment tooling with:\n"
            "  .\\.venv\\Scripts\\python.exe -m pip install -r requirements-deploy.txt"
        ) from exc

    api = HfApi(token=args.token)
    api.create_repo(
        repo_id=args.repo_id,
        repo_type="space",
        space_sdk="docker",
        private=not args.public,
        exist_ok=True,
    )

    commit = api.upload_folder(
        repo_id=args.repo_id,
        repo_type="space",
        folder_path=str(root),
        allow_patterns=REQUIRED_UPLOADS,
        ignore_patterns=[
            ".env",
            ".venv/**",
            "__pycache__/**",
            "exp_result/**",
            "LA/**",
            "lime_graph.png",
        ],
        commit_message="Deploy VeriVox Docker API",
    )

    if not args.skip_secrets:
        secrets = collect_space_secrets(root)
        missing_secrets = [key for key in ("GROQ_API_KEY", "API_SECRET_KEY") if key not in secrets]
        if missing_secrets:
            missing_list = ", ".join(missing_secrets)
            raise SystemExit(
                f"Uploaded files, but missing required Space secret values: {missing_list}. "
                "Add them to .env or environment variables, then rerun."
            )

        for key, value in secrets.items():
            api.add_space_secret(repo_id=args.repo_id, key=key, value=value)

        print("Configured Space secrets: " + ", ".join(sorted(secrets.keys())))

    print(f"Uploaded VeriVox Space files to {args.repo_id}.")
    print(f"Commit: {commit.oid}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
