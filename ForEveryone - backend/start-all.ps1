Write-Host "Iniciando todos los servicios..." -ForegroundColor Cyan

# 1. Identity API
Write-Host "[1/4] Levantando Identity API..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd src/Services/Identity/ForEveryone.Identity.Api; dotnet run"

# 2. Heroes API
Write-Host "[2/4] Levantando Heroes API..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd src/Services/Heroes/ForEveryone.Heroes.Api; dotnet run"

# 3. Kingdom API
Write-Host "[3/4] Levantando Kingdom API..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd src/Services/Kingdom/ForEveryone.Kingdom.Api; dotnet run"

# 4. Kingdom API
Write-Host "[3/4] Levantando Shop API..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd src/Services/Shop/ForEveryone.Shop.Api; dotnet run"

# 5. Frontend React
Write-Host "[4/4] Levantando Frontend React..." -ForegroundColor Green
# AJUSTA ESTA RUTA SI TU FRONTEND ESTÁ EN OTRA CARPETA
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\My way\code\Foreveryone\foreveryone-frontend'; npm run dev"

Write-Host "Todos los servicios se estan abriendo en ventanas separadas." -ForegroundColor Cyan