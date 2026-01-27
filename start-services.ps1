# Time Clock System - Start Services
# This script starts both Time Clock services

Write-Host "Starting Time Clock System services..." -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

# Start Server Service
Write-Host "Starting TimeClockServer..." -ForegroundColor Yellow
Start-Service -Name "TimeClockServer" -ErrorAction SilentlyContinue
if ($?) {
    Write-Host "  ✓ TimeClockServer started" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to start TimeClockServer" -ForegroundColor Red
}

# Start Client Service
Write-Host "Starting TimeClockClient..." -ForegroundColor Yellow
Start-Service -Name "TimeClockClient" -ErrorAction SilentlyContinue
if ($?) {
    Write-Host "  ✓ TimeClockClient started" -ForegroundColor Green
} else {
    Write-Host "  ✗ Failed to start TimeClockClient" -ForegroundColor Red
}
# Obtener la dirección IP local de la interfaz activa
$localIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPv4Address -notlike "169.*" }).IPv4Address | Select-Object -First 1

if (-not $localIp) { $localIp = "localhost" } # Fallback si no hay red
Write-Host ""
Write-Host "Services started. Access the application at:" -ForegroundColor White
Write-Host "  http://$($localIp):5173" -ForegroundColor Cyan
Write-Host ""
