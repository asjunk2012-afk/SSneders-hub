@echo off
echo Starting SSneder's Website Server...
echo.
echo Starting Database Server...
start cmd /k "cd /d %~dp0 && npm start"

echo.
echo Starting Website Server...
start cmd /k "cd /d %~dp0 && python -m http.server 8000"

echo.
echo Both servers are starting!
echo Database: http://localhost:3001
echo Website: http://localhost:8000
echo.
pause
