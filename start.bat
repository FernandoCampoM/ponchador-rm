@echo off
echo Starting Time Clock System...
start "Time Clock Server" cmd /k "cd server && node index.js"
start "Time Clock Client" cmd /k "cd client && npm run dev -- --host"
echo System started.
echo Client: http://localhost:5173 (or your IP)
echo Server: http://localhost:3000
pause
