$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$refreshScript = Join-Path $projectRoot "scripts\refresh-current-season.ps1"
$taskName = "F1 Dashboard Standings Refresh"

if (-not (Test-Path -LiteralPath $refreshScript)) {
  throw "Refresh script not found at $refreshScript"
}

$action = New-ScheduledTaskAction `
  -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$refreshScript`"" `
  -WorkingDirectory $projectRoot

$trigger = New-ScheduledTaskTrigger `
  -Once `
  -At (Get-Date).Date `
  -RepetitionInterval (New-TimeSpan -Hours 4) `
  -RepetitionDuration (New-TimeSpan -Days 3650)

$settings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Hours 2)

Register-ScheduledTask `
  -TaskName $taskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Description "Refreshes current-season F1 standings data every 4 hours." `
  -Force | Out-Null

Write-Host "Installed scheduled task: $taskName"
Write-Host "Refresh script: $refreshScript"
