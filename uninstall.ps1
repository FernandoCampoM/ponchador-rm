# Time Clock System - Uninstaller
# This script removes the Time Clock System services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Time Clock System - Uninstaller" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Uninstall Server Service
Write-Host "[1/4] Uninstalling TimeClockServer service..." -ForegroundColor Yellow
Set-Location "server"
if (Test-Path "uninstall-service.js") {
    node uninstall-service.js
    Start-Sleep -Seconds 5
    Write-Host "  ✓ TimeClockServer service uninstalled" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Uninstall script not found" -ForegroundColor Yellow
}
Set-Location ..

# Uninstall Client Service
Write-Host ""
Write-Host "[2/4] Uninstalling TimeClockClient service..." -ForegroundColor Yellow
Set-Location "client"
if (Test-Path "uninstall-service.cjs") {
    node uninstall-service.cjs
    Start-Sleep -Seconds 5
    Write-Host "  ✓ TimeClockClient service uninstalled" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Uninstall script not found" -ForegroundColor Yellow
}
Set-Location ..

# Remove Firewall Rules
Write-Host ""
Write-Host "[3/4] Removing Windows Firewall rules..." -ForegroundColor Yellow
Remove-NetFirewallRule -DisplayName "TimeClockServer" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "TimeClockClient" -ErrorAction SilentlyContinue
Write-Host "Firewall rules removed" -ForegroundColor Green

# Optional: Clean up build artifacts
Write-Host ""
Write-Host "[4/4] Cleanup options..." -ForegroundColor Yellow
$cleanup = Read-Host "Do you want to remove node_modules and build files? (y/N)"
if ($cleanup -eq "y" -or $cleanup -eq "Y") {
    Write-Host "  Removing server/node_modules..." -ForegroundColor Gray
    Remove-Item -Path "server\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "server\daemon" -Recurse -Force -ErrorAction SilentlyContinue
    
    Write-Host "  Removing client/node_modules..." -ForegroundColor Gray
    Remove-Item -Path "client\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "client\dist" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "client\daemon" -Recurse -Force -ErrorAction SilentlyContinue
    
    Write-Host "Cleanup complete" -ForegroundColor Green
} else {
    Write-Host "Skipped cleanup" -ForegroundColor Gray
}

# Uninstallation Complete
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Uninstallation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services removed:" -ForegroundColor White
Write-Host "  • TimeClockServer" -ForegroundColor White
Write-Host "  • TimeClockClient" -ForegroundColor White
Write-Host ""
Write-Host "Firewall rules removed." -ForegroundColor White
Write-Host ""
pause
