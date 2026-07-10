$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$logDir = Join-Path $projectRoot "logs"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = Join-Path $logDir "standings-refresh-$timestamp.log"
$currentYear = (Get-Date).ToUniversalTime().Year

New-Item -ItemType Directory -Force -Path $logDir | Out-Null
Set-Location $projectRoot

$env:F1_INGEST_START_YEAR = [string]$currentYear
$env:F1_INGEST_END_YEAR = [string]$currentYear

"[$(Get-Date -Format o)] Starting F1 standings refresh for $currentYear" | Tee-Object -FilePath $logFile

try {
  & npm.cmd run ingest:f1 *>&1 | Tee-Object -FilePath $logFile -Append
  $exitCode = $LASTEXITCODE

  if ($exitCode -ne 0) {
    throw "npm.cmd run ingest:f1 exited with code $exitCode"
  }

  "[$(Get-Date -Format o)] F1 standings refresh completed successfully" | Tee-Object -FilePath $logFile -Append
}
catch {
  "[$(Get-Date -Format o)] F1 standings refresh failed: $_" | Tee-Object -FilePath $logFile -Append
  exit 1
}
