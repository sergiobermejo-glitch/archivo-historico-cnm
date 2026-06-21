@echo off
title Archivo Historico CNM - Actualizador
color 0A

echo.
echo ==========================================
echo      ARCHIVO HISTORICO CNM v1.0
echo ==========================================
echo.

echo [1/4] Generando records.json...
call node scripts\generarRecords.cjs
if errorlevel 1 goto error

echo.
echo [2/4] Añadiendo cambios a Git...
git add .
if errorlevel 1 goto error

echo.
echo [3/4] Creando commit...

for /f %%i in ('powershell -command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do set FECHA=%%i

git commit -m "Actualizar records %FECHA%"
if errorlevel 1 (
    echo.
    echo No habia cambios para subir.
    goto fin
)

echo.
echo [4/4] Subiendo a GitHub...
git push
if errorlevel 1 goto error

echo.
echo ==========================================
echo      WEB ACTUALIZADA CORRECTAMENTE
echo ==========================================
echo.
pause
exit

:error
echo.
echo **************************************
echo HA OCURRIDO UN ERROR
echo **************************************
echo.
pause

:fin
echo.
pause