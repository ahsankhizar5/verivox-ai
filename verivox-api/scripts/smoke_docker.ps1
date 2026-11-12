param(
    [string]$ImageName = "verivox-api",
    [string]$ContainerName = "verivox-api-test",
    [int]$Port = 7860,
    [string]$AudioFile = "sample.wav"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".env")) {
    throw "Missing .env. Create it from .env.example and fill in real secrets first."
}

if (-not (Test-Path $AudioFile)) {
    throw "Missing audio file: $AudioFile"
}

$apiKeyLine = Get-Content ".env" | Where-Object { $_ -match "^\s*API_SECRET_KEY\s*=" } | Select-Object -First 1
if (-not $apiKeyLine) {
    throw "API_SECRET_KEY is missing from .env"
}

$apiKey = ($apiKeyLine -split "=", 2)[1].Trim()
if (-not $apiKey) {
    throw "API_SECRET_KEY is empty in .env"
}

$existingContainer = docker ps -aq --filter "name=^$ContainerName$"
if ($existingContainer) {
    docker rm -f $ContainerName | Out-Null
}

try {
    docker run -d --name $ContainerName --env-file .env -p "${Port}:7860" $ImageName | Out-Null

    $health = $null
    $lastHealthError = $null
    for ($attempt = 1; $attempt -le 60; $attempt++) {
        try {
            $health = Invoke-RestMethod "http://localhost:$Port/healthz"
            break
        }
        catch {
            $lastHealthError = $_.Exception.Message
            Start-Sleep -Seconds 2
        }
    }

    if (-not $health) {
        docker logs $ContainerName --tail 120
        throw "Health check did not become ready. Last error: $lastHealthError"
    }

    if ($health.status -ne "ok" -or -not $health.analyzer_loaded) {
        throw "Health check failed: $($health | ConvertTo-Json -Compress)"
    }

    $wrongAuth = curl.exe -s -o NUL -w "%{http_code}" -X POST `
        -H "X-API-Key: wrong" `
        -F "file=@$AudioFile;type=audio/wav" `
        "http://localhost:$Port/analyze"
    if ($wrongAuth -ne "401") {
        throw "Expected wrong-key request to return 401, got $wrongAuth"
    }

    $responseFile = New-TemporaryFile
    $statusCode = curl.exe -s -o $responseFile -w "%{http_code}" -X POST `
        -H "X-API-Key: $apiKey" `
        -F "file=@$AudioFile;type=audio/wav" `
        "http://localhost:$Port/analyze"
    if ($statusCode -ne "200") {
        $body = Get-Content -Raw $responseFile
        throw "Expected analyze request to return 200, got $statusCode. Body: $body"
    }

    $payload = Get-Content -Raw $responseFile | ConvertFrom-Json
    Remove-Item $responseFile -Force

    Write-Output "Analyze status: $statusCode"
    Write-Output "Spoof score: $($payload.spoof_score)"
    Write-Output "Description length: $($payload.text_description.Length)"
    Write-Output "Image prefix: $($payload.lime_graph_base64.Substring(0, [Math]::Min(22, $payload.lime_graph_base64.Length)))"
    Write-Output "Image length: $($payload.lime_graph_base64.Length)"
    Write-Output "Docker smoke test passed."
}
finally {
    $existingContainer = docker ps -aq --filter "name=^$ContainerName$"
    if ($existingContainer) {
        docker rm -f $ContainerName | Out-Null
    }
}
