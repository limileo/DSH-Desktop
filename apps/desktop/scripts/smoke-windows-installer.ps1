param(
  [Parameter(Mandatory = $true)]
  [string]$Installer
)

$ErrorActionPreference = 'Stop'
$installerPath = (Resolve-Path $Installer).Path
$installRoot = Join-Path $env:RUNNER_TEMP 'dsh-desktop-install-smoke'
$applicationPath = Join-Path $installRoot 'DSH Desktop.exe'
$uninstallerPath = Join-Path $installRoot 'Uninstall DSH Desktop.exe'

if (Test-Path $installRoot) {
  Remove-Item $installRoot -Recurse -Force
}

$portsBefore = @(
  Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
    Where-Object { $_.LocalAddress -in @('127.0.0.1', '0.0.0.0', '::1', '::') } |
    Select-Object -ExpandProperty LocalPort -Unique
)

Write-Host "Installing $installerPath into $installRoot"
$install = Start-Process -FilePath $installerPath -ArgumentList @('/S', "/D=$installRoot") -Wait -PassThru
if ($install.ExitCode -ne 0) {
  throw "Installer exited with code $($install.ExitCode)"
}
if (-not (Test-Path $applicationPath)) {
  throw "Installed application is missing: $applicationPath"
}

$application = $null
try {
  $application = Start-Process -FilePath $applicationPath -PassThru
  $deadline = (Get-Date).AddSeconds(90)
  $readyUrl = $null

  while ((Get-Date) -lt $deadline -and $null -eq $readyUrl) {
    if ($application.HasExited) {
      throw "Installed application exited during startup with code $($application.ExitCode)"
    }

    $candidatePorts = @(
      Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
        Where-Object {
          $_.LocalAddress -in @('127.0.0.1', '0.0.0.0', '::1', '::') -and
          $_.LocalPort -notin $portsBefore
        } |
        Select-Object -ExpandProperty LocalPort -Unique
    )

    foreach ($port in $candidatePorts) {
      $url = "http://127.0.0.1:$port/"
      try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3
        if ($response.StatusCode -eq 200 -and $response.Content -match '<div id="root"></div>') {
          $readyUrl = $url
          break
        }
      } catch {
        # Electron may open unrelated local ports while starting.
      }
    }

    if ($null -eq $readyUrl) {
      Start-Sleep -Milliseconds 500
    }
  }

  if ($null -eq $readyUrl) {
    throw 'Installed application did not expose its bundled Web Host within 90 seconds'
  }
  Write-Host "Installed application and bundled Web Host are ready at $readyUrl"
} finally {
  if ($null -ne $application -and -not $application.HasExited) {
    & taskkill.exe /PID $application.Id /T /F | Out-Host
  }
  if (Test-Path $uninstallerPath) {
    Start-Process -FilePath $uninstallerPath -ArgumentList '/S' -Wait
  }
}
