# Este script se movio a la raiz del repositorio, junto a docker-compose.yml y al
# .env que necesita. Aqui queda solo un reenvio para que las referencias
# antiguas, y quien lo tenga ya apuntado en otras maquinas, sigan funcionando.
#
#   cd "ForEveryone - backend"
#   .\start-all.ps1 -Rebuild
#
# El motivo del cambio es que este esperando a Shop en el puerto 5136, que ya no
# existe: Windows reserva el rango 5071-5170 en esta maquina, asi que Shop se
# publico en el 4136 y el script se quedaba 90 s esperando un puerto que nunca
# iba a abrir.

[CmdletBinding()]
param(
    [switch]$Rebuild,
    [switch]$Stop,
    [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'

$rootScript = Join-Path (Split-Path -Parent $PSScriptRoot) 'start-all.ps1'

if (-not (Test-Path $rootScript)) {
    Write-Host "  No encuentro el script en $rootScript" -ForegroundColor Red
    exit 1
}

$forwarded = @('-File', $rootScript)

foreach ($switch in @('-Rebuild', '-Stop', '-NoBrowser')) {
    $name = $switch.TrimStart('-')
    if ($PSBoundParameters.ContainsKey($name) -and $PSBoundParameters[$name]) {
        $forwarded += $switch
    }
}

& powershell -NoProfile -ExecutionPolicy Bypass @forwarded
exit $LASTEXITCODE
