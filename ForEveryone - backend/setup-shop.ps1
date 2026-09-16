# setup-shop.ps1
 $baseDir = "src/Services/Shop"
 $namespace = "ForEveryone.Shop"

 $projects = @(
    "$namespace.Domain",
    "$namespace.Application",
    "$namespace.Infrastructure",
    "$namespace.Api"
)

foreach ($proj in $projects) {
    $path = "$baseDir/$proj"
    if ($proj -like "*.Api") {
        dotnet new webapi -n $proj -o $path --use-controllers
    } else {
        dotnet new classlib -n $proj -o $path
    }
}

dotnet sln add "$baseDir/$namespace.Domain/$namespace.Domain.csproj"
dotnet sln add "$baseDir/$namespace.Application/$namespace.Application.csproj"
dotnet sln add "$baseDir/$namespace.Infrastructure/$namespace.Infrastructure.csproj"
dotnet sln add "$baseDir/$namespace.Api/$namespace.Api.csproj"

dotnet add "$baseDir/$namespace.Application/$namespace.Application.csproj" reference "$baseDir/$namespace.Domain/$namespace.Domain.csproj"
dotnet add "$baseDir/$namespace.Infrastructure/$namespace.Infrastructure.csproj" reference "$baseDir/$namespace.Application/$namespace.Application.csproj"
dotnet add "$baseDir/$namespace.Api/$namespace.Api.csproj" reference "$baseDir/$namespace.Infrastructure/$namespace.Infrastructure.csproj"

dotnet add "$baseDir/$namespace.Application/$namespace.Application.csproj" package MediatR
dotnet add "$baseDir/$namespace.Application/$namespace.Application.csproj" package FluentValidation
dotnet add "$baseDir/$namespace.Infrastructure/$namespace.Infrastructure.csproj" package Microsoft.EntityFrameworkCore
dotnet add "$baseDir/$namespace.Infrastructure/$namespace.Infrastructure.csproj" package Npgsql.EntityFrameworkCore.PostgreSQL

Write-Host "Esqueleto de Shop creado exitosamente."