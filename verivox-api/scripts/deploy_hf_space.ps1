param(
    [string]$RepoId = $env:HF_SPACE_ID,
    [string]$Token = $env:HF_TOKEN,
    [switch]$Public,
    [switch]$SkipSecrets
)

$ErrorActionPreference = "Stop"

if (-not $RepoId) {
    throw "Missing RepoId. Pass -RepoId username/verivox-api or set HF_SPACE_ID."
}

if (-not $Token) {
    if ($env:HUGGINGFACE_HUB_TOKEN) {
        $Token = $env:HUGGINGFACE_HUB_TOKEN
    }
    else {
        throw "Missing token. Set HF_TOKEN or HUGGINGFACE_HUB_TOKEN."
    }
}

$python = ".\.venv\Scripts\python.exe"
if (-not (Test-Path $python)) {
    $python = "python"
}

& $python -m pip install -r requirements-deploy.txt

$args = @("scripts/deploy_hf_space.py", "--repo-id", $RepoId, "--token", $Token)
if ($Public) {
    $args += "--public"
}
if ($SkipSecrets) {
    $args += "--skip-secrets"
}

& $python @args
