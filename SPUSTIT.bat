@echo off
cd /d "%~dp0"
chcp 65001 >nul
title PodPlot
echo.
echo  ========================================
echo   PodPlot — spousteni
echo  ========================================
echo.

set "NODE=C:\Users\monik\AppData\Local\Programs\cursor\resources\app\resources\helpers\node.exe"
if not exist "%NODE%" set "NODE=node"

"%NODE%" --version >nul 2>&1
if errorlevel 1 (
  echo  CHYBA: Node.js neni dostupny.
  echo  1^) Otevřete Cursor, nebo
  echo  2^) Nainstalujte Node.js z https://nodejs.org
  echo.
  pause
  exit /b 1
)

if not exist "lib\babel.min.js" (
  echo  CHYBA: Chybi lib\babel.min.js
  echo  OneDrive mozna jeste nestahlo soubory.
  echo  Pockejte na zelene fajfky u slozky app a zkuste znovu.
  echo.
  pause
  exit /b 1
)

for %%A in ("index.html") do set "INDEX_SIZE=%%~zA"
if not exist "index.html" set "INDEX_SIZE=0"
if "%INDEX_SIZE%"=="0" (
  echo  CHYBA: Soubor index.html je prazdny nebo chybi.
  echo  To casto zpusobi OneDrive. Reknete mi to v chatu — obnovim ho.
  echo.
  pause
  exit /b 1
)

echo  Adresa:   http://localhost:5173
echo  DULEZITE: Neotvirejte index.html primo z disku.
echo            Vzdy pouzijte tento SPUSTIT.bat
echo  Ukonceni: Ctrl+C v tomto okne
echo.

rem Uz bezi server?
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:5173/' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200 -and $r.Content.Length -gt 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if not errorlevel 1 (
  echo  Server uz bezi — oteviram prohlizec...
  start "" "http://localhost:5173"
  echo.
  echo  Pokud vidite prazdnou stranku, stisknete Ctrl+F5.
  echo.
  pause
  exit /b 0
)

echo  Startuji server...
start "" cmd /c "ping -n 4 127.0.0.1 >nul && start http://localhost:5173"
"%NODE%" server.mjs
set "ERR=%ERRORLEVEL%"
echo.
if not "%ERR%"=="0" (
  echo  Server skoncil s chybou %ERR%.
  echo  Zkuste zavrit ostatni okna PodPlot a spustit znovu.
)
pause
exit /b %ERR%
