# Arranca el entorno completo de desarrollo de Foreveryone.
#
# Uso (desde la carpeta "ForEveryone - backend"):
#   .\start-all.ps1
#   .\start-all.ps1 -Rebuild     fuerza a recompilar las imagenes de las APIs
#
# Las cuatro APIs y sus cuatro bases de datos PostgreSQL arrancan en Docker,
# orchestrated por el docker-compose.yml de la raiz del repositorio. El
# frontend sigue en local con Vite: su recarga en caliente es la parte del
# trabajo que mas se itera, y meterlo en un contenedor la estorba.
#
# Cada API se queda en su puerto de siempre (5045, 5281, 5256, 5136), asi que
# foreveryone-frontend/.env no necesita ningun cambio.
#
# La primera vez hay que crear el .env de credenciales, que esta en .gitignore:
#   copy ..\.env.example ..\.env
#
# Requisitos: Docker arrancado. Para parar todo:
#   docker compose down              (conserva los datos)
#   docker compose down -v           (borra tambien las bases de datos)

[CmdletBinding()]
param(
    # Recompila las imagenes aunque ya existan. Sin este parametro, compose
    # reutiliza la imagen previa y el arranque es casi instantaneo.
    [switch]$Rebuild
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

# Raiz del repositorio, un nivel por encima de "ForEveryone - backend".
$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendPath = Join-Path $repoRoot 'foreveryone-frontend'

# Puertos publicados por cada API. Deben coincidir con los de
# docker-compose.yml y con las variables VITE_* de foreveryone-frontend/.env.
$servicePorts = [ordered]@{
    'Identity API' = 5045
    'Heroes API'   = 5281
    'Kingdom API'  = 5256
    'Shop API'     = 5136
}

$total = $servicePorts.Count + 1
$step = 0

function Test-PortOpen([int]$Port) {
    try {
        $client = [System.Net.Sockets.TcpClient]::new()
        $task = $client.ConnectAsync('127.0.0.1', $Port)
        # Espera breve: si conecta rapido, el puerto esta listo.
        return $task.Wait(500) -and $client.Connected
    } catch {
        return $false
    } finally {
        if ($client) { $client.Dispose() }
    }
}

# Informa de que proceso ocupa un puerto, para poder decidir sin adivinar.
function Get-PortOwner([int]$Port) {
    $conn = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue |
        Select-Object -First 1

    if (-not $conn) { return $null }

    $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
    if ($proc) { return "$($proc.ProcessName) (PID $($proc.Id))" }
    return "PID $($conn.OwningProcess)"
}

# Si el puerto ya esta ocupado, normalmente es un contenedor de una ejecucion
# anterior que sigue en pie. No tiene sentido relanzarlo ni esperar: se avisa y
# se sigue, en lugar de esperar 60 s para luego decir que no respondio.
function Test-PortBusy([string]$Name, [int]$Port) {
    if (-not (Test-PortOpen $Port)) { return $false }

    $owner = Get-PortOwner $Port
    Write-Host "    $Name ya responde en el puerto $Port ($owner)." -ForegroundColor Yellow
    Write-Host "    Para reiniciarla, ejecuta 'docker compose restart' o '.\start-all.ps1 -Rebuild'." -ForegroundColor DarkGray
    return $true
}

function Wait-ForPort([string]$Name, [int]$Port, [int]$TimeoutSeconds = 90) {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-PortOpen $Port) {
            Write-Host "    $Name respondio en el puerto $Port" -ForegroundColor DarkGray
            return $true
        }
        Start-Sleep -Milliseconds 500
    }

    Write-Host "    $Name no respondio en $TimeoutSeconds s. Revisa 'docker compose logs $Name'." -ForegroundColor Yellow
    return $false
}

Write-Host ''
Write-Host '  Foreveryone - iniciando el entorno completo' -ForegroundColor Cyan
Write-Host "  $($servicePorts.Count) APIs + $($servicePorts.Count) bases de datos en Docker" -ForegroundColor DarkGray
Write-Host "  1 frontend en local" -ForegroundColor DarkGray
Write-Host ''

# --- Docker ------------------------------------------------------------
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host '  Docker no esta instalado o no esta en el PATH.' -ForegroundColor Red
    Write-Host '  Instalalo y abre esta terminal de nuevo.' -ForegroundColor Red
    exit 1
}

# docker info no falla con codigo 0 cuando el demonio esta parado, asi que se
# comprueba la salida y no solo el ultimo codigo de error.
$dockerInfo = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host '  El demonio de Docker no responde. Abre Docker Desktop y espera a que arranque.' -ForegroundColor Red
    Write-Host '  Detalle: ' + ($dockerInfo | Select-Object -First 1) -ForegroundColor DarkGray
    exit 1
}

$envFile = Join-Path $repoRoot '.env'
if (-not (Test-Path $envFile)) {
    Write-Host '  Falta el .env de credenciales en la raiz del repositorio.' -ForegroundColor Red
    Write-Host '  Crealo una vez con:' -ForegroundColor Yellow
    Write-Host '      copy ..\.env.example ..\.env' -ForegroundColor Yellow
    Write-Host '  Docker Compose lo necesita para crear las cuatro bases de datos.' -ForegroundColor Yellow
    exit 1
}

Write-Host '  Levantando Docker Compose...'
Push-Location $repoRoot
try {
    if ($Rebuild) {
        docker compose up -d --build
    } else {
        # Sin --build: compose reutiliza las imagenes existentes y solo compila
        # si falta alguna, que es el caso de la primera ejecucion.
        docker compose up -d
    }

    if ($LASTEXITCODE -ne 0) {
        Write-Host '  "docker compose up" fallo. Revisa los errores anteriores.' -ForegroundColor Red
        exit 1
    }
} finally {
    Pop-Location
}
Write-Host ''

foreach ($entry in $servicePorts.GetEnumerator()) {
    $step++
    $name = $entry.Key
    $port = $entry.Value

    Write-Host "[$step/$total] $name..." -ForegroundColor Green

    if (Test-PortBusy $name $port) { continue }

    Wait-ForPort $name $port | Out-Null
}

# --- Frontend ----------------------------------------------------------
$step++
Write-Host "[$step/$total] Frontend..." -ForegroundColor Green

if (-not (Test-Path $frontendPath)) {
    Write-Host "    Frontend no encontrado en $frontendPath" -ForegroundColor Red
} elseif (Test-PortBusy 'Frontend' 5173) {
    # Nada que hacer: Vite ya esta sirviendo.
} else {
    # Vite esta fijado al puerto 5173 con strictPort, asi que si el puerto esta
    # ocupado avisara en lugar de arrancar en otro y romper el CORS.
    Start-Process powershell -ArgumentList @(
        '-NoExit', '-Command',
        "Set-Location '$frontendPath'; npm run dev"
    )

    Wait-ForPort 'Frontend' 5173 | Out-Null
}

Write-Host ''
Write-Host '  Entorno listo. Abre http://localhost:5173' -ForegroundColor Green
Write-Host '  Para detenerlo:' -ForegroundColor DarkGray
Write-Host '    docker compose down' -ForegroundColor DarkGray
Write-Host '    cierra ademas la ventana del frontend' -ForegroundColor DarkGray
Write-Host ''