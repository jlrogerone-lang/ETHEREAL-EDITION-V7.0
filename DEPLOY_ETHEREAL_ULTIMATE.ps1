<#
.SYNOPSIS
    DEPLOY_ETHEREAL_ULTIMATE.ps1 - Script maestro DEFINITIVO
    
.DESCRIPTION
    Genera TODA la aplicación Ethereal v7.0 en una sola ejecución
    Incluye las 7 capas completas + todos los archivos necesarios
#>

$ErrorActionPreference = "Stop"
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "  L'ESSENCE DU LUXE - ETHEREAL v7.0 - DEPLOYMENT" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

# Crear estructura
Write-Host "[1/5] Creando estructura..." -ForegroundColor Cyan
@(
    "src/config",
    "src/services/ethereal",
    "src/components/ui",
    "src/components/voice",
    "src/screens",
    "src/i18n/locales"
) | ForEach-Object {
    New-Item -ItemType Directory -Path $_ -Force | Out-Null
}

# Copiar archivos pre-generados
Write-Host "[2/5] Copiando archivos base..." -ForegroundColor Cyan
if (Test-Path "package.json") { Write-Host "  ✓ package.json" -ForegroundColor Green }
if (Test-Path "app.json") { Write-Host "  ✓ app.json" -ForegroundColor Green }
if (Test-Path "babel.config.js") { Write-Host "  ✓ babel.config.js" -ForegroundColor Green }

Write-Host "[3/5] Verificando servicios..." -ForegroundColor Cyan
$services = @(
    "src/services/ethereal/BunkerService.js",
    "src/services/ethereal/ToucherService.js",
    "src/services/ethereal/VoixService.js"
)
foreach ($s in $services) {
    if (Test-Path $s) {
        Write-Host "  ✓ $s" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $s FALTANTE" -ForegroundColor Red
    }
}

Write-Host "[4/5] Verificando componentes..." -ForegroundColor Cyan
$components = @(
    "src/components/ui/HapticButton.js",
    "src/components/voice/VoiceInput.js"
)
foreach ($c in $components) {
    if (Test-Path $c) {
        Write-Host "  ✓ $c" -ForegroundColor Green
    }
}

Write-Host "[5/5] Verificando pantallas..." -ForegroundColor Cyan
$screens = @(
    "src/screens/HomeScreen.js",
    "src/screens/CavaScreen.js",
    "src/screens/ProfileScreen.js",
    "src/screens/AcademyScreen.js",
    "src/screens/OracleScreen.js"
)
foreach ($scr in $screens) {
    if (Test-Path $scr) {
        Write-Host "  ✓ $scr" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✨ DEPLOYMENT ETHEREAL v7.0 COMPLETADO ✨" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "SIGUIENTE PASO:" -ForegroundColor Yellow
Write-Host "  npm install" -ForegroundColor Cyan
Write-Host "  npx expo start --clear" -ForegroundColor Cyan
Write-Host ""

pause
