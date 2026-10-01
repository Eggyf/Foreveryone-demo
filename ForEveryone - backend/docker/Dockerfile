# Dockerfile único para las cuatro APIs de Foreveryone.
#
# Qué servicio se compila lo decide el build arg PROJECT, de modo que las
# cuatro imágenes comparten este archivo en lugar de mantener cuatro copias
# que se desincronizan entre sí. La dll de arranque la fija cada servicio en
# docker-compose.yml mediante la variable APP_DLL.

ARG RUNTIME_TAG=10.0

# --- Compilación ---------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:${RUNTIME_TAG} AS build
ARG PROJECT
WORKDIR /src

# El contexto de compilación es la raíz de "ForEveryone - backend", así que
# aquí están tanto el proyecto elegido como sus referencias: Infrastructure,
# Application, Domain y SharedKernel.
COPY . .

# Restore y publish comparten la misma capa a proposito. Un "RUN --mount=type=cache"
# para NuGet seria mas rapido entre builds, pero el cache mount es efimero: lo que
# se descarga a traves de el no queda en el sistema de archivos, y el publish
# posterior con --no-restore no encontraria los paquetes (error NETSDK1064).
# Como restore escribe ya en una capa real, la segunda ejecucion reaprovecha todo.
RUN dotnet restore "$PROJECT" \
    && dotnet publish "$PROJECT" -c Release -o /app/publish --no-restore

# --- Ejecución -----------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:${RUNTIME_TAG} AS final
WORKDIR /app
COPY --from=build /app/publish .

# Dentro de la red de Docker la API tiene que escuchar en todas las
# interfaces ("+"). Si escuchara solo en loopback, el puerto publicado en el
# host no llegaría a responder.
#
# El puerto concreto lo sobrescribe cada servicio en docker-compose.yml.
ENV ASPNETCORE_URLS=http://+:5045

# La API corre como usuario sin privilegios. Los puertos publicados (5045,
# 5281, 5256, 5136) están por encima de 1024, así que no hace falta root.
USER app

# APP_DLL llega del compose, por ejemplo "ForEveryone.Identity.Api.dll".
# "exec" reemplaza el shell para que dotnet reciba las señales directamente y
# "docker compose stop" no espere al timeout de cierre.
ENTRYPOINT ["sh", "-c", "exec dotnet \"$APP_DLL\""]