# Serve os ficheiros estáticos em http://127.0.0.1:8080/ (evita erros com file://)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$port = 8080
Write-Host ""
Write-Host "  Mercado — servidor local" -ForegroundColor Cyan
Write-Host "  Abra no browser: http://127.0.0.1:$port/index.html" -ForegroundColor Green
Write-Host "  Ctrl+C para parar." -ForegroundColor DarkGray
Write-Host ""

if (Get-Command python -ErrorAction SilentlyContinue) {
    python -m http.server $port
    exit 0
}
if (Get-Command py -ErrorAction SilentlyContinue) {
    py -m http.server $port
    exit 0
}

Write-Host "Python nao encontrado. Instale Python (python.org) ou use Node:" -ForegroundColor Yellow
Write-Host "  npx --yes serve -l $port ." -ForegroundColor Yellow
if (Get-Command npx -ErrorAction SilentlyContinue) {
    npx --yes serve -l $port .
    exit 0
}
exit 1
