# Time Clock System - Stop Services
# This script stops both Time Clock services

Write-Host "Stopping Time Clock System services..." -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

# Stop Server Service
Write-Host "Stopping TimeClockServer..." -ForegroundColor Yellow
Stop-Service -Name "TimeClockServer" -ErrorAction SilentlyContinue
if ($?) {
    Write-Host "  ✓ TimeClockServer stopped" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to stop TimeClockServer (may not be running)" -ForegroundColor Yellow
}

# Stop Client Service
Write-Host "Stopping TimeClockClient..." -ForegroundColor Yellow
Stop-Service -Name "TimeClockClient" -ErrorAction SilentlyContinue
if ($?) {
    Write-Host "  ✓ TimeClockClient stopped" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to stop TimeClockClient (may not be running)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Services stopped." -ForegroundColor White
Write-Host ""
