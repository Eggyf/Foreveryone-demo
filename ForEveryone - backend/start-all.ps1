# Arranca los cuatro servicios backend y el frontend del juego Foreveryone.
#
# Uso (desde la carpeta "ForEveryone - backend"):
#   .\start-all.ps1
#
# Cada proceso se abre en su propia ventana para poder ver su log.
# El script espera a que cada API responda antes de lanzar la siguiente, porque
# Identity debe existir antes que Heroes: al crear un heroe, Heroes llama a
# Identity para comprobar que la cuenta existe.
#
# Los servicios se lanzan con "dotnet <dll>" en lugar de "dotnet run".
# Motivo: "dotnet run" intenta ejecutar el .exe generado, y si ese fichero
# queda bloqueado por otro proceso el arranque falla con
# "The process cannot access the file because it is being used by another
# process". Ejecutando el .dll se evita por completo ese bloqueo.

$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

# Raiz del repositorio, dos niveles por encima de "ForEveryone - backend".
$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendPath = Join-Path $repoRoot 'foreveryone-frontend'

# Nombre legible -> ruta del proyecto .Api dentro de la solucion.
$services = [ordered]@{
    'Identity API' = 'src\Services\Identity\ForEveryone.Identity.Api'
    'Heroes API'   = 'src\Services\Heroes\ForEveryone.Heroes.Api'
    'Kingdom API'  = 'src\Services\Kingdom\ForEveryone.Kingdom.Api'
    'Shop API'     = 'src\Services\Shop\ForEveryone.Shop.Api'
}

# Puertos tomados de cada Properties\launchSettings.json (perfil "http").
$servicePorts = [ordered]@{
    'Identity API' = 5045
    'Heroes API'   = 5281
    'Kingdom API'  = 5256
    'Shop API'     = 5136
}

$total = $services.Count + 1
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

# Si el puerto ya esta ocupado, el servicio normalmente sigue vivo de una
# ejecucion anterior. No tiene sentido relanzarlo ni esperar: se avisa y se
# sigue, en lugar de esperar 60 s para luego decir que no respondio.
function Test-PortBusy([string]$Name, [int]$Port) {
    if (-not (Test-PortOpen $Port)) { return $false }

    $owner = Get-PortOwner $Port
    Write-Host "    $Name ya esta corriendo en el puerto $Port ($owner). Se reutiliza." -ForegroundColor Yellow
    Write-Host "    Para reiniciarlo, cierra esa ventana y vuelve a ejecutar este script." -ForegroundColor DarkGray
    return $true
}

function Wait-ForPort([string]$Name, [int]$Port, [int]$TimeoutSeconds = 60) {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-PortOpen $Port) {
            Write-Host "    $Name respondio en el puerto $Port" -ForegroundColor DarkGray
            return $true
        }
        Start-Sleep -Milliseconds 500
    }

    Write-Host "    $Name no respondio en $TimeoutSeconds s. Revisa su ventana." -ForegroundColor Yellow
    return $false
}

Write-Host ''
Write-Host '  Foreveryone - iniciando el entorno completo' -ForegroundColor Cyan
Write-Host "  $($services.Count) APIs + 1 frontend" -ForegroundColor DarkGray
Write-Host ''

# Se compila una sola vez para que todos los servicios sirvan el mismo codigo
# y no un binario antiguo.
Write-Host '  Compilando la solucion...' -ForegroundColor Cyan
& dotnet build ForEveryone.slnx -c Debug --nologo -v quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host '  La compilacion fallo. Revisa los errores anteriores.' -ForegroundColor Red
    exit 1
}
Write-Host '  Compilacion correcta.' -ForegroundColor DarkGray
Write-Host ''

foreach ($entry in $services.GetEnumerator()) {
    $step++
    $name = $entry.Key
    $projectPath = $entry.Value
    $port = $servicePorts[$name]

    if (-not (Test-Path $projectPath)) {
        Write-Host "[$step/$total] $name no encontrado en $projectPath" -ForegroundColor Red
        continue
    }

    Write-Host "[$step/$total] Levantando $name..." -ForegroundColor Green

    if (Test-PortBusy $name $port) { continue }

    # Nombre del ensamblado, por ejemplo ForEveryone.Identity.Api.dll
    $assembly = Split-Path -Leaf $projectPath
    $dll = Join-Path $projectPath "bin\Debug\net10.0\$assembly.dll"

    if (-not (Test-Path $dll)) {
        Write-Host "    No se encontro $dll. Revisa la compilacion." -ForegroundColor Red
        continue
    }

    # Se replica el perfil "http" de launchSettings.json: mismo puerto y
    # ASPNETCORE_ENVIRONMENT=Development, que es lo que hace que las APIs
    # apliquen las migraciones pendientes al arrancar.
    Start-Process powershell -ArgumentList @(
        '-NoExit', '-Command',
        "`$env:ASPNETCORE_ENVIRONMENT='Development'; " +
        "Set-Location '$PSScriptRoot'; " +
        "dotnet '$dll' --urls 'http://localhost:$port'"
    )

    Wait-ForPort $name $port | Out-Null
}

$step++
Write-Host "[$step/$total] Levantando Frontend..." -ForegroundColor Green

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
Write-Host '  Para detenerlo, cierra las ventanas abiertas o ejecuta:' -ForegroundColor DarkGray
Write-Host '    Get-Process dotnet,node -ErrorAction SilentlyContinue | Stop-Process -Force' -ForegroundColor DarkGray
Write-Host ''
