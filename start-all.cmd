@echo off
REM Lanzador de Foreveryone. Doble clic y levanta el proyecto entero.
REM
REM Existe por una razon concreta: al hacer doble clic en un .ps1, el menu
REM contextual ejecuta "powershell.exe -file <script>" SIN -ExecutionPolicy, y si
REM la politica de ejecucion esta en Restricted (el valor por defecto de Windows,
REM y el que tiene esta maquina) el script no llega ni a arrancar. La ventana
REM aparece, suelta el error y se cierra, que es justo lo que parece un fallo
REM del script cuando en realidad lo rechaza Windows antes de leer la primera
REM linea.
REM
REM Un .cmd no pasa por el motor de PowerShell, asi que este archivo se ejecuta
REM siempre. Delega en start-all.ps1 con -ExecutionPolicy Bypass, que vale solo
REM para esa llamada y no cambia la politica de la maquina.
REM
REM   start-all.cmd               arranca Docker Compose y Vite
REM   start-all.cmd -Rebuild      recompila las imagenes de las APIs
REM   start-all.cmd -Stop         para todo conservando los datos
REM   start-all.cmd -NoBrowser    no abre el navegador
REM
REM Los argumentos se pasan tal cual. El script espera en la raiz del repositorio,
REM y la carpeta de un .cmd es su propia carpeta: desde el explorador coincide,
REM pero si se llama con ruta absoluta desde otro sitio, no.

setlocal

cd /d "%~dp0"

if not exist "%~dp0start-all.ps1" (
    echo.
    echo   No encuentro start-all.ps1 junto a este archivo.
    echo   deberia estar en "%~dp0start-all.ps1"
    echo.
    pause
    exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-all.ps1" %*
set "codigo=%ERRORLEVEL%"

REM El pause va siempre: este archivo esta pensado para doble clic, y en ese
REM caso la ventana se cerraria al terminar y perderia tanto el resumen como el
REM error. Invocado desde una terminal de verdad cuesta pulsar una tecla.
REM
REM Si molesta al ejecutarlo desde linea de comandos, se llama al .ps1
REM directamente con:
REM   powershell -ExecutionPolicy Bypass -File .\start-all.ps1

echo.
pause

exit /b %codigo%
