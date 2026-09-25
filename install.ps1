# Nyimba setup (PowerShell — run from repo root)
Set-Location $PSScriptRoot

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Install Node.js 20+ from https://nodejs.org"
    exit 1
}

if (-not (Test-Path backend\.env)) {
    Copy-Item backend\.env.example backend\.env
    Write-Host "Created backend\.env — edit DATABASE_URL (Neon) before migrate."
}

if (-not (Test-Path frontend\.env)) {
    Set-Content frontend\.env "VITE_API_URL="
}

npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Next (after DATABASE_URL is set in backend\.env):"
Write-Host "  npm run db:migrate"
Write-Host ""
Write-Host "Run the app:"
Write-Host "  .\start.ps1   or   npm run dev"
Write-Host "  Open http://127.0.0.1:5173"
