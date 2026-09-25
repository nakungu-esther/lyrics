Set-Location $PSScriptRoot
if (-not (Test-Path node_modules)) {
    Write-Host "Run .\install.ps1 first"
    exit 1
}
if (-not (Test-Path backend\.env)) {
    Copy-Item backend\.env.example backend\.env
}
Write-Host "LyricsHub → http://127.0.0.1:5173"
npm run dev
