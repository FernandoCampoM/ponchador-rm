# Time Clock System - Unattended Installer
# This script installs the Time Clock System as Windows services
# Allow self-signed HTTPS certificates
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }




Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Time Clock System - Installer" -ForegroundColor Cyan
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

# 1. Configuración de Seguridad Total (TLS 1.2 y 1.3)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13

# 2. Definir versión CORRECTA (20.18.1)
$version = "v20.19.6"
$url = "https://nodejs.org/dist/$version/node-$version-x64.msi"
$installerPath = Join-Path $env:TEMP "nodejs_installer.msi"

Write-Host "--- Iniciando Instalación de Node.js $version ---" -ForegroundColor Cyan

try {
    # 3. Descarga robusta
    Write-Host "[1/3] Descargando instalador..." -ForegroundColor Yellow
    $webClient = New-Object System.Net.WebClient
    $webClient.DownloadFile($url, $installerPath)
    
    # 4. Instalación silenciosa
    Write-Host "[2/3] Ejecutando instalador (esto puede tardar un minuto)..." -ForegroundColor Yellow
    $process = Start-Process msiexec.exe -ArgumentList "/i `"$installerPath`" /qn /norestart" -Wait -PassThru
    
    if ($process.ExitCode -eq 0) {
        Write-Host "[3/3] ¡Éxito! Node.js se instaló correctamente." -ForegroundColor Green
    } else {
        Write-Host "[!] Error: El instalador devolvió el código $($process.ExitCode). Prueba ejecutar como Administrador." -ForegroundColor Red
    }
}
catch {
    Write-Host "[!] ERROR CRÍTICO: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Verifica que tengas conexión a internet y que el archivo $url sea accesible." -ForegroundColor Gray
}
finally {
    if (Test-Path $installerPath) { Remove-Item $installerPath -Force }
}

# 5. Refrescar el entorno para que 'node' funcione de inmediato
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verificar final
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "Versión detectada: $(node -v)" -ForegroundColor Green
} else {
    Write-Host "Node aún no es reconocido. Por favor, cierra y abre esta terminal." -ForegroundColor Yellow
}

# Check for Node.js
Write-Host "[1/8] Checking for Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  [OK] Node.js found: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "  [ERROR] Node.js not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "Download the LTS version and run this installer again." -ForegroundColor Yellow
    pause
    exit 1
}

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Install Server Dependencies
Write-Host ""
Write-Host "[2/8] Installing server dependencies y configuración de certificados..." -ForegroundColor Yellow
Set-Location "server"
Write-Host "Verificando Chocolatey..." -ForegroundColor Cyan

# 1. Instalar Chocolatey si no existe
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Chocolatey no encontrado. Instalando..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    
    # Comando oficial de instalación de Chocolatey
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    # Refrescar el PATH para que reconozca 'choco' de inmediato sin cerrar la consola
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}
npm install
choco install mkcert
mkcert -install

# Definir la ruta base de la carpeta server
$serverPath = Join-Path $PSScriptRoot "server"

# Definir la ruta de certificados dentro de server
$certDir = Join-Path $serverPath "certs"

# Crear la carpeta si no existe
if (!(Test-Path $certDir)) {
    New-Item -ItemType Directory -Force -Path $certDir
}

# Definir rutas de archivos
$keyFile = Join-Path $certDir "key.pem"
$certFile = Join-Path $certDir "cert.pem"

# Intentar obtener IP de adaptadores con nombres específicos en orden
# Definimos los patrones de búsqueda
$prioridades = @("*Ethernet*", "*Wi-Fi*", "*Inalámbrica*")
$listaIPs = @("localhost", "127.0.0.1") # Empezamos con las básicas

foreach ($nombre in $prioridades) {
    # Buscamos todas las IPs que coincidan con el nombre
    $ipsEncontradas = Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias $nombre -ErrorAction SilentlyContinue | 
                      Where-Object { $_.IPAddress -notlike "169.254.*" } | 
                      Select-Object -ExpandProperty IPAddress

    if ($ipsEncontradas) {
        foreach ($ip in $ipsEncontradas) {
            if ($listaIPs -notcontains $ip) {
                $listaIPs += $ip
            }
        }
    }
}

# Fallback: Si la lista solo tiene localhost, buscar la ruta predeterminada
if ($listaIPs.Count -le 2) {
    $fallbackIP = (Get-NetRoute -DestinationPrefix 0.0.0.0/0 -ErrorAction SilentlyContinue | 
                   Get-NetIPAddress -AddressFamily IPv4).IPAddress | Select-Object -First 1
    if ($fallbackIP -and ($listaIPs -notcontains $fallbackIP)) { $listaIPs += $fallbackIP }
}

# Convertir la lista en un string separado por espacios para usar con mkcert
$ipStringParaMkcert = $listaIPs -join " "

Write-Host "IPs detectadas para el certificado: $ipStringParaMkcert" -ForegroundColor Cyan
Write-Host "Generando certificados para: $ipStringParaMkcert" -ForegroundColor Cyan

# Ejecutar mkcert (Equivalente al execSync)
& mkcert -key-file "$keyFile" -cert-file "$certFile" $listaIPs
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] Failed to install server dependencies" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "  [OK] Server dependencies installed" -ForegroundColor Green
# Configure Windows Firewall
Write-Host ""
Write-Host "[3/8] Configuring Windows Firewall..." -ForegroundColor Yellow

# Remove existing rules if they exist
Remove-NetFirewallRule -DisplayName "TimeClockServer" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "TimeClockClient" -ErrorAction SilentlyContinue
# Create firewall rule for Server (port 3000)
New-NetFirewallRule -DisplayName "TimeClockServer" -Description "Allows inbound connections to Time Clock Server API (port 3000)" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Enabled True -Profile Any | Out-Null

Write-Host "  [OK] Firewall rule created for Server (port 3000)" -ForegroundColor Green

# Create firewall rule for Client (port 444)
New-NetFirewallRule -DisplayName "TimeClockClient" -Description "Allows inbound connections to Time Clock Client interface (port 444)" -Direction Inbound -Protocol TCP -LocalPort 444 -Action Allow -Enabled True -Profile Any | Out-Null

Write-Host "  [OK] Firewall rule created for Client (port 444)" -ForegroundColor Green

# Install Server Service
Write-Host ""
Write-Host "[4/8] Installing TimeClockServer service..." -ForegroundColor Yellow
node install-service.js
Start-Sleep -Seconds 5

# Start Server Service
Start-Service -Name "TimeClockServer"
Start-Sleep -Seconds 5

Set-Location ..

# Install Client Dependencies
Write-Host ""
Write-Host "[5/8] Installing client dependencies..." -ForegroundColor Yellow
Set-Location "client"
npm install
# Definir la ruta base de la carpeta client
$clientPath = Join-Path $PSScriptRoot "client"

# Definir la ruta de certificados dentro de client
$certDir = Join-Path $clientPath "certs"

# Crear la carpeta si no existe
if (!(Test-Path $certDir)) {
    New-Item -ItemType Directory -Force -Path $certDir
}

# Definir rutas de archivos
$keyFile = Join-Path $certDir "key.pem"
$certFile = Join-Path $certDir "cert.pem"

Write-Host "Generando certificados de Client para: $ipStringParaMkcert" -ForegroundColor Cyan

# Ejecutar mkcert (Equivalente al execSync)
& mkcert -key-file "$keyFile" -cert-file "$certFile" $listaIPs
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] Failed to install client dependencies" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "  [OK] Client dependencies installed" -ForegroundColor Green

# Build Client for Production
Write-Host ""
Write-Host "[6/8] Building client for production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [ERROR] Failed to build client" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "[OK] Client built successfully" -ForegroundColor Green

# Install Client Service
Write-Host ""
Write-Host "[7/8] Installing TimeClockClient service..." -ForegroundColor Yellow
node install-service.cjs
Start-Sleep -Seconds 5
Write-Host "  [OK] TimeClockClient service installed" -ForegroundColor Green
Start-Sleep -Seconds 5

# Start Client Service
Start-Service -Name "TimeClockClient"
Start-Sleep -Seconds 5
Set-Location ..

# Verify Services
Write-Host ""
Write-Host "[8/8] Verifying services..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

$serverService = Get-Service -Name "TimeClockServer" -ErrorAction SilentlyContinue
$clientService = Get-Service -Name "TimeClockClient" -ErrorAction SilentlyContinue

if ($serverService -and $serverService.Status -eq "Running") {
    Write-Host "  [OK] TimeClockServer is running" -ForegroundColor Green
}
else {
    Write-Host "  [WARNING] TimeClockServer status: $($serverService.Status)" -ForegroundColor Yellow
}

if ($clientService -and $clientService.Status -eq "Running") {
    Write-Host "  [OK] TimeClockClient is running" -ForegroundColor Green
}
else {
    Write-Host "  [WARNING] TimeClockClient status: $($clientService.Status)" -ForegroundColor Yellow
}
# Instalación Completada
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "¡Instalación Completada!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Servicios instalados y configurados:" -ForegroundColor White
Write-Host "  - TimeClockServer (Puerto 3000)" -ForegroundColor White
Write-Host "  - TimeClockClient (Puerto 444)" -ForegroundColor White
Write-Host ""
Write-Host "Acceda a la aplicación en:" -ForegroundColor White
Write-Host "Acceda a la aplicación en cualquiera de estas rutas:" -ForegroundColor White
foreach ($ip in $listaIPs) {
    Write-Host "  - https://$($ip):444" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "Los servicios se iniciarán automáticamente con Windows." -ForegroundColor White
Write-Host "Reglas de firewall configuradas para acceso remoto." -ForegroundColor White
Write-Host ""
Write-Host "To manage services, use:" -ForegroundColor White
Write-Host "  - service-status.ps1  - Check status" -ForegroundColor Gray
Write-Host "  - start-services.ps1  - Start services" -ForegroundColor Gray
Write-Host "  - stop-services.ps1   - Stop services" -ForegroundColor Gray
Write-Host "  - uninstall.ps1       - Uninstall services" -ForegroundColor Gray
Write-Host ""
pause
