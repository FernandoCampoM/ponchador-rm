# Time Clock System - Service Status
# This script displays the status of both Time Clock services

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Time Clock System - Service Status" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get Server Service Status
$serverService = Get-Service -Name "TimeClockServer" -ErrorAction SilentlyContinue
if ($serverService) {
    Write-Host "TimeClockServer:" -ForegroundColor Yellow
    Write-Host "  Status:     $($serverService.Status)" -ForegroundColor $(if ($serverService.Status -eq "Running") { "Green" } else { "Red" })
    Write-Host "  Start Type: $($serverService.StartType)" -ForegroundColor White
    Write-Host "  Display:    $($serverService.DisplayName)" -ForegroundColor Gray
} else {
    Write-Host "TimeClockServer: NOT INSTALLED" -ForegroundColor Red
}

Write-Host ""

# Get Client Service Status
$clientService = Get-Service -Name "TimeClockClient" -ErrorAction SilentlyContinue
if ($clientService) {
    Write-Host "TimeClockClient:" -ForegroundColor Yellow
    Write-Host "  Status:     $($clientService.Status)" -ForegroundColor $(if ($clientService.Status -eq "Running") { "Green" } else { "Red" })
    Write-Host "  Start Type: $($clientService.StartType)" -ForegroundColor White
    Write-Host "  Display:    $($clientService.DisplayName)" -ForegroundColor Gray
} else {
    Write-Host "TimeClockClient: NOT INSTALLED" -ForegroundColor Red
}

Write-Host ""

# Check Firewall Rules
Write-Host "Firewall Rules:" -ForegroundColor Yellow
$serverRule = Get-NetFirewallRule -DisplayName "TimeClockServer" -ErrorAction SilentlyContinue
$clientRule = Get-NetFirewallRule -DisplayName "TimeClockClient" -ErrorAction SilentlyContinue

if ($serverRule) {
    Write-Host "  TimeClockServer (port 3000): $($serverRule.Enabled)" -ForegroundColor $(if ($serverRule.Enabled) { "Green" } else { "Red" })
} else {
    Write-Host "  TimeClockServer: NOT CONFIGURED" -ForegroundColor Red
}

if ($clientRule) {
    Write-Host "  TimeClockClient (port 5173): $($clientRule.Enabled)" -ForegroundColor $(if ($clientRule.Enabled) { "Green" } else { "Red" })
} else {
    Write-Host "  TimeClockClient: NOT CONFIGURED" -ForegroundColor Red
}

Write-Host ""

# Check if ports are listening
Write-Host "Port Status:" -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
$port5173 = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue

if ($port3000) {
    Write-Host "  Port 3000 (Server): LISTENING" -ForegroundColor Green
} else {
    Write-Host "  Port 3000 (Server): NOT LISTENING" -ForegroundColor Red
}

if ($port5173) {
    Write-Host "  Port 5173 (Client): LISTENING" -ForegroundColor Green
} else {
    Write-Host "  Port 5173 (Client): NOT LISTENING" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($serverService.Status -eq "Running" -and $clientService.Status -eq "Running") {
    Write-Host "✓ All services are running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access the application at:" -ForegroundColor White
    Write-Host "  http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
}
