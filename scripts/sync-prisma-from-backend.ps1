# Sync Prisma schema + migration lock FROM pranidoctor-backend (canonical owner) TO web.
# Run after backend schema changes, then: npm run db:generate
param(
  [string]$BackendRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\pranidoctor-backend")).Path,
  [string]$WebRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

$ErrorActionPreference = "Stop"

$files = @(
  @{ Src = "prisma\schema.prisma"; Dst = "prisma\schema.prisma" },
  @{ Src = "prisma\migrations\migration_lock.toml"; Dst = "prisma\migrations\migration_lock.toml" }
)

Write-Host "Syncing Prisma canonical files: backend -> web..."
Write-Host "  Backend: $BackendRoot"
Write-Host "  Web:     $WebRoot"

foreach ($f in $files) {
  $src = Join-Path $BackendRoot $f.Src
  $dst = Join-Path $WebRoot $f.Dst
  if (-not (Test-Path $src)) { throw "Missing source: $src" }
  Copy-Item $src $dst -Force
  Write-Host "  OK $($f.Dst)"
}

Write-Host ""
Write-Host "Next (in pranidoctor-web):"
Write-Host "  npm run db:generate"
Write-Host ""
Write-Host "Migrations are NOT auto-copied. Apply via pranidoctor-backend only."
