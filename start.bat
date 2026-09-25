@echo off
echo ============================================
echo  Nyimba - one app (API + UI together)
echo ============================================
echo.
echo  Open in browser:  http://127.0.0.1:5173
echo.

if not exist node_modules (
    echo Run install.bat first.
    pause
    exit /b 1
)

if not exist backend\.env copy backend\.env.example backend\.env

echo Starting API (4000) and UI (5173)...
echo For uploads/video jobs: start Docker Desktop, then  docker-compose up -d  and  npm run dev:all
echo.

npm run dev
