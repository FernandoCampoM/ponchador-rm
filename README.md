


# Time Clock System

A professional time clock system for Retail Manager that allows employees to clock in and out using their User ID and password.

## 🚀 Quick Start

### Installation

1. **Prerequisites**: Ensure Node.js is installed (download from [nodejs.org](https://nodejs.org/))

2. **Run the installer** (as Administrator):
   ```powershell
   powershell -ExecutionPolicy Bypass -File install.ps1
   ```

3. **Access the application**:
   - Local: http://localhost:5173
   - Network: http://[SERVER-IP]:5173

The installer will:
- ✅ Install all dependencies
- ✅ Build the production client
- ✅ Configure Windows Firewall (ports 3000 & 5173)
- ✅ Install and start Windows services
- ✅ Configure automatic startup

## 📋 Service Management

### Check Status
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

### Uninstall
```powershell
powershell -ExecutionPolicy Bypass -File uninstall.ps1
```

## 🔧 Services

- **TimeClockServer** - Backend API (port 3000)
- **TimeClockClient** - Frontend interface (port 5173)

Both services:
- Start automatically on system boot
- Restart automatically on failure
- Run as Windows services

## 📖 Documentation

See [INSTALLATION.md](INSTALLATION.md) for detailed installation instructions, troubleshooting, and configuration options.

## 🏗️ Architecture

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: SQL Server (POSDPS database)
- **Deployment**: Windows Services via node-windows

## 🔥 Firewall Configuration

The installer automatically creates firewall rules:
- **TimeClockServer**: TCP port 3000 (inbound)
- **TimeClockClient**: TCP port 5173 (inbound)

## 🛠️ Development Mode

For development (not as a service):
```bash
# Terminal 1 - Start server
cd server
node index.js

# Terminal 2 - Start client dev server
cd client
npm run dev
```

Or use the original batch file:
```bash
start.bat
```

## 📝 Configuration

### Database Connection
Edit `server\index.js` to configure SQL Server:
```javascript
const dbConfig = {
    user: 'sa',
    password: 'your_password',
    server: 'localhost',
    database: 'POSDPS',
    // ...
};
```

After changes, restart the service:
```powershell
Restart-Service TimeClockServer
```

## 🔍 Troubleshooting

### Services won't start
1. Check Event Viewer (Windows Logs → Application)
2. Verify Node.js is installed: `node --version`
3. Test database connection: `cd server && node test_db_connection.js`

### Can't access from other computers
1. Verify firewall rules: `Get-NetFirewallRule -DisplayName "TimeClock*"`
2. Check services are listening: `netstat -an | findstr "3000 5173"`
3. Ensure SQL Server is accessible

### View service logs
- Server logs: `server\daemon\` directory
- Client logs: `client\daemon\` directory
- Event Viewer: Windows Logs → Application

## 📦 Project Structure

```
PONCHADOR RM/
├── client/                 # React frontend
│   ├── src/
│   ├── dist/              # Production build
│   ├── server.js          # Production server
│   ├── install-service.js # Service installer
│   └── package.json
├── server/                # Express backend
│   ├── index.js           # Main server file
│   ├── install-service.js # Service installer
│   └── package.json
├── install.ps1            # Main installer
├── uninstall.ps1          # Uninstaller
├── start-services.ps1     # Start services
├── stop-services.ps1      # Stop services
├── service-status.ps1     # Check status
├── INSTALLATION.md        # Detailed guide
└── README.md              # This file
```

## 🎯 Features

- ✅ Employee clock in/out with User ID
- ✅ Real-time clock display
- ✅ SQL Server integration
- ✅ Automatic service recovery
- ✅ Network accessible
- ✅ Firewall auto-configuration
- ✅ Production-ready deployment

## 📄 License

Internal use for Retail Manager

---

**Need help?** Check [INSTALLATION.md](INSTALLATION.md) for detailed documentation.
