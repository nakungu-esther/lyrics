@echo off
echo ============================================
echo  Lyrics platform - install
echo ============================================
echo.

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js 20+ required.
    pause
    exit /b 1
)

call npm install
if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)

if not exist backend\.env copy backend\.env.example backend\.env
if not exist frontend\.env (
  echo VITE_API_URL=>frontend\.env
)

echo.
echo Run Nyimba ^(one command^):
echo   start.bat   or   npm run dev
echo   Open http://127.0.0.1:5173
echo.
echo See docs\RUN.md
pause
