# Time Clock System - Installation Guide

## Prerequisites

- **Windows Operating System** (Windows 10/11 or Windows Server 2016+)
- **Administrator Privileges** (required for service installation and firewall configuration)
- **Node.js** (version 14 or higher)
  - Download from: https://nodejs.org/
  - The installer will check for Node.js and provide instructions if not found

## Installation Steps

### 1. Download and Extract

Extract the Time Clock System files to your desired location (e.g., `C:\TimeClockSystem`)

### 2. Run the Installer

Open PowerShell as Administrator and navigate to the installation directory:

```powershell
cd "d:\ANTIGRAVITY\PONCHADOR RM"
```

Run the installer:

```powershell
powershell -ExecutionPolicy Bypass -File install.ps1
```

The installer will:
- ✅ Check for Node.js installation
- ✅ Install npm dependencies for server and client
- ✅ Build the production client
- ✅ Configure Windows Firewall rules (ports 3000 and 5173)
- ✅ Install and start Windows services
- ✅ Configure automatic startup and recovery

### 3. Verify Installation

Check service status:

```powershell
powershell -File service-status.ps1
```

Both services should show as "Running" with StartType "Automatic"

### 4. Access the Application

- **Client Interface**: http://localhost:5173
- **From other computers**: http://[SERVER-IP]:5173
- **Server API**: http://localhost:3000

## Service Management

### Check Service Status

```powershell
powershell -File service-status.ps1
```

### Start Services

```powershell
powershell -File start-services.ps1
```

### Stop Services

```powershell
powershell -File stop-services.ps1
```

### Using Windows Services Manager

1. Press `Win + R`, type `services.msc`, press Enter
2. Look for:
   - **TimeClockServer** - Backend API service
   - **TimeClockClient** - Frontend web interface

## Firewall Configuration

The installer automatically creates these firewall rules:

- **TimeClockServer** - Allows TCP inbound on port 3000
- **TimeClockClient** - Allows TCP inbound on port 5173

To view firewall rules:

```powershell
Get-NetFirewallRule -DisplayName "TimeClock*" | Format-Table DisplayName, Enabled, Direction, Action
```

## Troubleshooting

### Services Won't Start

1. Check Windows Event Viewer:
   - Press `Win + R`, type `eventvwr.msc`, press Enter
   - Navigate to: Windows Logs → Application
   - Look for errors from "TimeClockServer" or "TimeClockClient"

2. Check Node.js installation:
   ```powershell
   node --version
   npm --version
   ```

3. Verify database connection (SQL Server must be running):
   ```powershell
   cd server
   node test_db_connection.js
   ```

### Cannot Access from Other Computers

1. Verify firewall rules are enabled:
   ```powershell
   Get-NetFirewallRule -DisplayName "TimeClock*"
   ```

2. Check if services are listening:
   ```powershell
   netstat -an | findstr "3000 5173"
   ```

3. Ensure the server's IP address is accessible from the client computer

### Services Keep Stopping

1. Check the service logs in Event Viewer
2. Verify SQL Server is running and accessible
3. Check database credentials in `server\index.js`

## Uninstallation

To completely remove the Time Clock System services:

```powershell
powershell -ExecutionPolicy Bypass -File uninstall.ps1
```

This will:
- Stop both services
- Remove service registrations
- Remove firewall rules
- Optionally clean up node_modules and build files

## Configuration

### Database Connection

Edit `server\index.js` to configure SQL Server connection:

```javascript
const dbConfig = {
    user: 'sa',
    password: 'your_password',
    server: 'localhost',
    database: 'POSDPS',
    // ...
};
```

After changing configuration, restart the service:

```powershell
Restart-Service TimeClockServer
```

### Change Ports

To change the default ports:

1. **Server Port (default 3000)**:
   - Edit `server\index.js`: Change `const PORT = 3000;`
   - Update firewall rule or run uninstall/install again

2. **Client Port (default 5173)**:
   - Edit `client\server.js`: Change `const PORT = 5173;`
   - Update firewall rule or run uninstall/install again

## Logs and Monitoring

Service logs are written to:
- **Server**: `server\daemon\` directory
- **Client**: `client\daemon\` directory

View logs in real-time using Event Viewer or check the daemon folders.

## Support

For issues or questions, check:
1. Windows Event Viewer for service errors
2. Service log files in daemon directories
3. SQL Server connection and permissions
