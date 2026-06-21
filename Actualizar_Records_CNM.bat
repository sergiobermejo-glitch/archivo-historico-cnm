@echo off
title Actualizar récords CNM
color 0A

echo.
echo ============================================
echo        ACTUALIZAR RECORDS CNM
echo ============================================
echo.

@echo off
setlocal

title Actualizar Records CNM
color 0A

echo.
echo ==========================================
echo      ARCHIVO HISTORICO CNM
echo ==========================================
echo.

::--------------------------------------------------
:: 1. Generar records.json
::--------------------------------------------------

echo [1/7] Generando records.json...
echo.

node scripts\generarRecords.cjs

if errorlevel 1 (
    color 0C
    echo.
    echo ERROR generando records.json
    pause
    exit /b 1
)

echo.
echo OK records.json generado.

::--------------------------------------------------
:: 2. Validacion
::--------------------------------------------------

echo.
echo [2/7] Validando datos...
echo.

if not exist public\records.json (
    color 0C
    echo ERROR: No existe public\records.json
    pause
    exit /b 1
)

echo OK Validacion completada.

::--------------------------------------------------
:: 3. Build
::--------------------------------------------------

echo.
echo [3/7] Compilando la web...
echo.

call npm run build

if errorlevel 1 (
    color 0C
    echo ERROR durante el build.
    pause
    exit /b 1
)

echo OK Build correcto.

::--------------------------------------------------
:: 4. Git add
::--------------------------------------------------

echo.
echo [4/7] Git add...
git add .

if errorlevel 1 (
    color 0C
    echo ERROR en git add.
    pause
    exit /b 1
)

::--------------------------------------------------
:: 5. Git commit
::--------------------------------------------------

echo.
echo [5/7] Git commit...

git commit -m "Actualizacion records %date% %time%"

:: Si no hay cambios, continuar igualmente

::--------------------------------------------------
:: 6. Git push
::--------------------------------------------------

echo.
echo [6/7] Git push...
echo.

git push

if errorlevel 1 (
    color 0C
    echo ERROR en git push.
    pause
    exit /b 1
)

echo OK Publicado en GitHub.

::--------------------------------------------------
:: 7. Esperar despliegue
::--------------------------------------------------

echo.
echo [7/7] Esperando despliegue de GitHub Pages...
timeout /t 20 >nul

start https://historico.cnmediterraneo.com

echo.
echo ==========================================
echo      ACTUALIZACION COMPLETADA
echo ==========================================
echo.
echo La web se ha abierto automaticamente.
echo.

pause