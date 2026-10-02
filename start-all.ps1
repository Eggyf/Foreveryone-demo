# Arranca el proyecto completo de Foreveryone desde la raiz del repositorio.
#
# Uso:
#   .\start-all.ps1
#   .\start-all.ps1 -Rebuild     fuerza a recompilar las imagenes de las APIs
#   .\start-all.ps1 -Stop        para todo (conserva los datos)
#   .\start-all.ps1 -NoBrowser   no abre el navegador al final
#
# Que levanta:
#   - 4 bases de datos PostgreSQL y 4 APIs en Docker (docker-compose.yml)
#   - el frontend con Vite en local, puerto 5173
#
# El frontend sigue en local a proposito: su recarga en caliente es la parte del
# trabajo que mas se itera, y meterlo en un contenedor la estorba. El script lo
# abre en su propia ventana para que el log de Vite se vea sin mezclarse con el
# de Docker.
#
# Requisitos:
#   - Docker arrancado (Docker Desktop abierto y listo)
#   - Node.js instalado
#   - el .env de credenciales en la raiz, que esta en .gitignore. La primera vez:
#       copy .env.example .env
#     Ojo: si ya existen los volumenes, NO sobrescribas el .env con el ejemplo.
#     PostgreSQL solo aplica POSTGRES_PASSWORD al crear el volumen, y un cambio
#     despues produce "28P01 password authentication failed for user postgres".
#     Para empezar de cero: docker compose down -v (borra los datos).
#
# Si PowerShell no deja ejecutar scripts, no cambies la politica del equipo:
# ejecuta el script asi, que vale igual y solo afecta a esta llamada:
#   powershell -ExecutionPolicy Bypass -File .\start-all.ps1

[CmdletBinding()]
param(
    # Recompila las imagenes aunque ya existan. Sin este parametro, compose
    # reutiliza la imagen previa y el arranque es casi instantaneo.
    [switch]$Rebuild,

    # Para el entorno en vez de arrancarlo.
    [switch]$Stop,

    # No abre el navegador al terminar.
    [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$frontendPath = Join-Path $PSScriptRoot 'foreveryone-frontend'

# Puertos publicados por cada API. Deben coincidir con docker-compose.yml y con
# las variables VITE_* de foreveryone-frontend/.env.
$servicePorts = [ordered]@{
    'Identity API' = 5045
    'Heroes API'   = 5281
    'Kingdom API'  = 5256
    # 4136 y no 5136: el 5136 cae en el rango 5071-5170 que Windows reserva en
    # esta maquina, y en un puerto excluido ni Docker publica ni ASP.NET escucha.
    'Shop API'     = 4136
}

$frontendPort = 5173

# Comprueba si un puerto acepta conexiones.
#
# Se prueban las dos familias de direcciones porque no escuchan en la misma.
# Vite arranca con host "localhost", que en Windows resuelve a ::1 antes que a
# 127.0.0.1, asi que queda escuchando solo en IPv6; y un TcpClient creado sin
# argumento usa AddressFamily InterNetwork, con el que conectar a ::1 falla
# siempre. Comprobar solo 127.0.0.1 daria "puerto libre" mientras Vite ya esta
# sirviendo. Las APIs de Docker publican en todas las interfaces, asi que
# responderian igual por las dos; el frontend es el caso que importa.
function Test-PortOpen([int]$Port) {
    $addresses = @(
        @{ Family = [System.Net.Sockets.AddressFamily]::InterNetwork;   Host = '127.0.0.1' }
        @{ Family = [System.Net.Sockets.AddressFamily]::InterNetworkV6; Host = '::1' }
    )

    foreach ($target in $addresses) {
        $client = $null
        try {
            $client = [System.Net.Sockets.TcpClient]::new($target.Family)
            $task = $client.ConnectAsync($target.Host, $Port)
            # Espera breve: si conecta rapido, el puerto esta listo.
            if ($task.Wait(700) -and $client.Connected) { return $true }
        } catch {
            # Esta direccion no responde: se prueba la siguiente.
        } finally {
            if ($client) { $client.Dispose() }
        }
    }

    return $false
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
# se sigue, en lugar de esperar 90 s para luego decir que no respondio.
function Test-PortBusy([string]$Name, [int]$Port) {
    if (-not (Test-PortOpen $Port)) { return $false }

    $owner = Get-PortOwner $Port
    Write-Host "    $Name ya responde en el puerto $Port ($owner)." -ForegroundColor Yellow
    Write-Host "    Para reiniciarla: .\start-all.ps1 -Stop y luego .\start-all.ps1." -ForegroundColor DarkGray
    return $true
}

# Espera a que un puerto acepte conexiones.
#
# Para el frontend esto basta: Vite sirve el index en cuanto abre el socket. Para
# las APIs no, y por eso tienen su propia espera con HTTP.
function Wait-ForPort([string]$Name, [int]$Port, [int]$TimeoutSeconds = 90) {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-PortOpen $Port) {
            Write-Host "    $Name respondio en el puerto $Port" -ForegroundColor DarkGray
            return $true
        }
        Start-Sleep -Milliseconds 500
    }

    Write-Host "    $Name no respondio en $TimeoutSeconds s. Revisa la ventana de Vite." -ForegroundColor Yellow
    return $false
}

# Espera a que una API responda por HTTP.
#
# El puerto no sirve como señal de que este lista: Docker abre el socket en el
# host en cuanto arranca el contenedor, y ASP.NET tarda despues en publicar los
# endpoints. Medido en este proyecto, el puerto de Identity acepta conexiones
# unos dos segundos antes de que swagger devuelva 200, asi que esperar solo al
# socket daba por buena una API que todavia iba a fallar.
#
# Se consulta swagger porque las cuatro lo sirven en Development y no requiere
# autenticacion ni datos de prueba. Un 404 tambien cuenta como lista: significa
# que hay algo escuchando y respondiendo, que es lo que se necesita saber.
function Wait-ForApi([string]$Name, [int]$Port, [int]$TimeoutSeconds = 90) {
    $url = "http://localhost:$Port/swagger/index.html"
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

    while ((Get-Date) -lt $deadline) {
        if (Test-HttpResponds $url) {
            Write-Host "    $Name respondio por HTTP en el puerto $Port" -ForegroundColor DarkGray
            return $true
        }
        Start-Sleep -Milliseconds 500
    }

    Write-Host "    $Name no respondio por HTTP en $TimeoutSeconds s. Revisa 'docker compose logs'." -ForegroundColor Yellow
    return $false
}

# ¿Contesta la URL con cualquier codigo HTTP? Se acepta tambien un 404 porque
# prueba que hay un servidor escuchando, que es lo que se esta esperando.
function Test-HttpResponds([string]$Url) {
    try {
        $null = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
        return $true
    } catch [System.Net.WebException] {
        # Si hay codigo de estado, hay un servidor escuchando respondiendo. Un
        # error de conexion o de tiempo agotado, en cambio, no lo demuestra.
        $status = $_.Exception.Response.StatusCode.value__
        return [bool]$status
    } catch {
        return $false
    }
}

# Resuelve npm a su ejecutable real.
#
# En Windows `npm` tambien existe como `npm.ps1`, y PowerShell da prioridad al
# .ps1. Con la politica de ejecucion restringida (el valor por defecto en cuentas
# de empresa y en instalaciones nuevas) eso falla con "la ejecucion de scripts
# esta deshabilitada", y el script de arranque parece roto cuando el problema es
# la politica. `npm.cmd` no la necesita, asi que se llama siempre a ese.
$npmCommand = $null

function Resolve-NpmCommand {
    if ($script:npmCommand) { return $script:npmCommand }

    $cmd = Get-Command npm.cmd -ErrorAction SilentlyContinue
    if ($cmd) {
        $script:npmCommand = $cmd.Source
        return $script:npmCommand
    }

    # Situacion poco habitual (PATH sin npm.cmd): se prueba el shim .ps1 y se
    # avisa si tampoco existe, para que el fallo sea claro.
    $ps1 = Get-Command npm -ErrorAction SilentlyContinue
    if ($ps1) {
        $script:npmCommand = $ps1.Source
        return $script:npmCommand
    }

    return $null
}

function Invoke-Npm {
    param([Parameter(Mandatory)][string[]]$Arguments)

    $npm = Resolve-NpmCommand
    if (-not $npm) {
        Write-Host '  No se encuentra npm. Node.js esta instalado?' -ForegroundColor Red
        exit 1
    }

    & $npm @Arguments
}

function Test-DockerReady {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host '  Docker no esta instalado o no esta en el PATH.' -ForegroundColor Red
        Write-Host '  Instalalo y abre esta terminal de nuevo.' -ForegroundColor Red
        return $false
    }

    # docker info no falla con codigo 0 cuando el demonio esta parado, asi que se
    # comprueba la salida y no solo el ultimo codigo de error.
    $dockerInfo = docker info 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host '  El demonio de Docker no responde. Abre Docker Desktop y espera a que arranque.' -ForegroundColor Red
        Write-Host '  Detalle: ' + ($dockerInfo | Select-Object -First 1) -ForegroundColor DarkGray
        return $false
    }

    return $true
}

function Stop-Environment {
    Write-Host ''
    Write-Host '  Foreveryone - parando el entorno' -ForegroundColor Cyan
    Write-Host ''

    # El frontend corre en una ventana de PowerShell aparte, asi que se para por
    # puerto en lugar de por proceso de Vite: cualquier nodo escuchando en 5173
    # es el dev server.
    $viteConn = Get-NetTCPConnection -State Listen -LocalPort $frontendPort -ErrorAction SilentlyContinue |
        Select-Object -First 1

    if ($viteConn) {
        $viteProc = Get-Process -Id $viteConn.OwningProcess -ErrorAction SilentlyContinue
        if ($viteProc) {
            Write-Host "  Deteniendo el frontend ($($viteProc.ProcessName), PID $($viteProc.Id))..."
            Stop-Process -Id $viteProc.Id -Force -ErrorAction SilentlyContinue
        } else {
            Write-Host "  El puerto $frontendPort esta ocupado por un proceso que ya no existe." -ForegroundColor Yellow
        }
    } else {
        Write-Host "  El frontend ya estaba parado."
    }

    Write-Host '  Deteniendo Docker Compose (los datos se conservan)...'
    docker compose down
    Write-Host ''
    Write-Host '  Entorno parado. Las bases de datos siguen ahi.' -ForegroundColor Green
    Write-Host '  Para borrar tambien los datos: docker compose down -v' -ForegroundColor DarkGray
    Write-Host ''
}

if ($Stop) {
    if (-not (Test-DockerReady)) { exit 1 }
    Stop-Environment
    exit 0
}

Write-Host ''
Write-Host '  Foreveryone - iniciando el proyecto completo' -ForegroundColor Cyan
Write-Host "  $($servicePorts.Count) APIs + $($servicePorts.Count) bases de datos en Docker" -ForegroundColor DarkGray
Write-Host '  1 frontend con Vite en local' -ForegroundColor DarkGray
Write-Host ''

if (-not (Test-DockerReady)) { exit 1 }

if (-not (Get-Command node -ErrorAction SilentlyContinue) -or -not (Resolve-NpmCommand)) {
    Write-Host '  Node.js no esta instalado o no esta en el PATH.' -ForegroundColor Red
    Write-Host '  El frontend lo necesita: instalalo y abre esta terminal de nuevo.' -ForegroundColor Red
    exit 1
}

$envFile = Join-Path $PSScriptRoot '.env'
if (-not (Test-Path $envFile)) {
    Write-Host '  Falta el .env de credenciales en la raiz del repositorio.' -ForegroundColor Red
    Write-Host '  Crealo una vez con:' -ForegroundColor Yellow
    Write-Host '      copy .env.example .env' -ForegroundColor Yellow
    Write-Host '  Docker Compose lo necesita para crear las cuatro bases de datos.' -ForegroundColor Yellow
    Write-Host '  Despues de crearlo, rellena las contrasenas: no sirven los valores de ejemplo.' -ForegroundColor Yellow
    exit 1
}

# --- Dependencias del frontend -----------------------------------------
# Solo se instala si falta node_modules: con las dependencias ya bajadas es un
# simple paseo, y sin este comprobacion habria que acordarse de hacerlo a mano
# la primera vez.
if (-not (Test-Path (Join-Path $frontendPath 'node_modules'))) {
    Write-Host '  node_modules no existe: instalando dependencias del frontend...' -ForegroundColor Green
    Push-Location $frontendPath
    try {
        Invoke-Npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host '  "npm install" fallo. Revisa los errores anteriores.' -ForegroundColor Red
            exit 1
        }
    } finally {
        Pop-Location
    }
    Write-Host ''
}

$total = $servicePorts.Count + 1
$step = 0

# --- Docker -------------------------------------------------------------
Write-Host '  Levantando Docker Compose...'
if ($Rebuild) {
    docker compose up -d --build
} else {
    # Sin --build: compose reutiliza las imagenes existentes y solo compila si
    # falta alguna, que es el caso de la primera ejecucion.
    docker compose up -d
}

if ($LASTEXITCODE -ne 0) {
    Write-Host '  "docker compose up" fallo. Revisa los errores anteriores.' -ForegroundColor Red
    exit 1
}
Write-Host ''

foreach ($entry in $servicePorts.GetEnumerator()) {
    $step++
    Write-Host "[$step/$total] $($entry.Key)..." -ForegroundColor Green

    if (Test-PortBusy $entry.Key $entry.Value) {
        # Ya habia una instancia en pie. Aun asi se espera a que responda por
        # HTTP: puede ser un contenedor de la ejecucion anterior al que le falta
        # terminar de arrancar.
        Wait-ForApi $entry.Key $entry.Value | Out-Null
        continue
    }

    Wait-ForApi $entry.Key $entry.Value | Out-Null
}

# --- Frontend -----------------------------------------------------------
$step++
Write-Host "[$step/$total] Frontend..." -ForegroundColor Green

if (-not (Test-Path (Join-Path $frontendPath 'package.json'))) {
    Write-Host "    No encuentro package.json en $frontendPath" -ForegroundColor Red
    exit 1
}

if (Test-PortBusy 'Frontend' $frontendPort) {
    # Nada que hacer: Vite ya esta sirviendo.
} else {
    # Vite esta fijado al puerto 5173 con strictPort, asi que si el puerto esta
    # ocupado avisara en lugar de arrancar en otro y romper el CORS.
    #
    # Se lanza el ejecutable de npm resuelto y no el shim `npm`: ver
    # Resolve-NpmCommand. La ruta va entrecomillada porque "Program Files" tiene
    # espacios y sin comillas la ventana arrancaria con una ruta partida.
    $npm = Resolve-NpmCommand

    Start-Process powershell -ArgumentList @(
        '-NoExit', '-Command',
        "Set-Location '$frontendPath'; & '$npm' run dev"
    )

    if (-not (Wait-ForPort 'Frontend' $frontendPort)) {
        Write-Host ''
        Write-Host '  El frontend no arranco. Lo mas probable es que falte Node.js.' -ForegroundColor Red
        Write-Host '  Mira el error en la ventana que se acaba de abrir.' -ForegroundColor DarkGray
        exit 1
    }
}

# --- Resumen -----------------------------------------------------------
$appUrl = "http://localhost:$frontendPort"

Write-Host ''
Write-Host '  Entorno listo.' -ForegroundColor Green
Write-Host ''
Write-Host "    Juego        $appUrl" -ForegroundColor Green
Write-Host "    Identity API http://localhost:5045/swagger" -ForegroundColor DarkGray
Write-Host "    Heroes API   http://localhost:5281/swagger" -ForegroundColor DarkGray
Write-Host "    Kingdom API  http://localhost:5256/swagger" -ForegroundColor DarkGray
Write-Host "    Shop API     http://localhost:4136/swagger" -ForegroundColor DarkGray
Write-Host ''

if (-not $NoBrowser) {
    Start-Process $appUrl
}

Write-Host '  Para pararlo todo:' -ForegroundColor DarkGray
Write-Host '    .\start-all.ps1 -Stop          (conserva los datos)' -ForegroundColor DarkGray
Write-Host '    docker compose down -v         (borra tambien las bases de datos)' -ForegroundColor DarkGray
Write-Host ''
