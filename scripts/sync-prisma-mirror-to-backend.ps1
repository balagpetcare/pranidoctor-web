# DEPRECATED for BACKEND-FIRST — canonical owner is backend.
# Routine flow: change schema in backend, then sync-prisma-from-backend.ps1 (backend -> web).
$ErrorActionPreference = "Stop"
Write-Host ""
Write-Host "DEPRECATED: sync-prisma-mirror-to-backend.ps1 (web -> backend)" -ForegroundColor Yellow
Write-Host "  BACKEND-FIRST: edit prisma in pranidoctor-backend." -ForegroundColor Yellow
Write-Host "  Then: .\scripts\sync-prisma-from-backend.ps1" -ForegroundColor Yellow
Write-Host ""
exit 1
