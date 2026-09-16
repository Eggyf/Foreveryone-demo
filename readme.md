# 🛡️ ForEveryone - Eldoria RPG Engine
Un motor de videojuego web de rol y gestión (RPG/Idle) construido con una arquitectura de Microservicios en .NET, aplicando Domain-Driven Design (DDD), Clean Architecture, y los principios SOLID. El frontend está desarrollado con React + TypeScript.

El proyecto simula un ecosistema de juego real donde los jugadores pueden registrarse, crear héroes, luchar contra monstruos, fundar reinos, generar recursos pasivamente, entrenar ejércitos y comprar equipo.

# 🏛️ Arquitectura del Sistema
El backend está dividido en 4 microservicios independientes, cada uno con su propia base de datos PostgreSQL aislada (Database per Service pattern). La comunicación entre servicios es síncrona mediante HTTP (Patrón API Gateway / Service-to-Service).

Identity Microservice: Gestiona el registro de usuarios y la autenticación mediante JWT.
Heroes Microservice: Maneja el aggregate root Hero, combate por turnos, subida de nivel, estadísticas y oro. Se comunica con Identity para verificar usuarios y con Shop para validar compras.
Kingdom Microservice: Maneja el aggregate root Kingdom, generación pasiva de recursos (Lazy Evaluation timestamp-based), construcción y mejora de edificios, y entrenamiento de tropas.
Shop Microservice: Catálogo de items (read-only) desacoplado. Los héroes consultan este servicio al comprar equipo.
# 🛠️ Tech Stack
## Backend:

.NET 10 / ASP.NET Core
Entity Framework Core (PostgreSQL via npgsql)
MediatR (Implementación de CQRS)
FluentValidation (Validación de invariantes de dominio)
Arquitectura: Clean Architecture, DDD, SOLID
## Frontend:

React 19 / TypeScript
Vite (Bundler)
React Router DOM (Navegación SPA)
Axios (Cliente HTTP con interceptores JWT)
CSS Puro (Tema Dark Fantasy)
⚙️ Mecánicas de Juego Implementadas
Autenticación Real: Registro y Login con JWT. El token se inyecta automáticamente en las peticiones protegidas.
Combate RPG: Sistema de turnos que calcula daño (Ataque - Defensa). Si el HP llega a 0, el héroe debe "Descansar".
Progresión: Subida de niveles mediante experiencia, lo que aumenta permanentemente las stats del héroe.
Gestión de Recursos: Construcción de granjas, aserraderos, etc. Los edificios se pueden mejorar (Upgrades) para aumentar la producción.
Ingresos Pasivos (Idle): El servidor calcula los recursos generados basándose en la diferencia de tiempo desde la última visita del jugador (con un tope de 2 horas para evitar stockpiling infinito).
Sistema Militar: Entrenamiento de soldados en el Cuartel y cálculo de Poder Militar.
Tienda Dinámica: Los jugadores gastan el Oro ganado en combate en espadas, armaduras y pociones que modifican permanentemente las stats del héroe.
🚀 Instalación y Ejecución Local
Prerrequisitos
.NET 10 SDK
Node.js (v18 o superior)
Servidor PostgreSQL local (ej. pgAdmin o Docker)
1. Configurar Bases de Datos
Crea 4 bases de datos vacías en tu PostgreSQL:

CREATE DATABASE foreveryone_identity;CREATE DATABASE foreveryone_heroes;CREATE DATABASE foreveryone_kingdom;CREATE DATABASE foreveryone_shop;
2. Configurar Backend (.NET)
En cada proyecto de API (*.Api), navega a la carpeta y configura los User Secrets para la cadena de conexión y URLs de los servicios:

powershell

cd src/Services/Identity/ForEveryone.Identity.Api
dotnet user-secrets set "ConnectionStrings:IdentityDb" "Host=localhost;Port=5432;Database=foreveryone_identity;Username=postgres;Password=TU_PASSWORD"
(Repetir el proceso para Heroes, Kingdom y Shop, indicando sus respectivas bases de datos y URLs de comunicación entre servicios).

3. Ejecutar Backend
Navega a la raíz del backend donde se encuentra el archivo .sln y ejecuta:

powershell

dotnet build
dotnet run --project src/Services/Identity/ForEveryone.Identity.Api
dotnet run --project src/Services/Heroes/ForEveryone.Heroes.Api
dotnet run --project src/Services/Kingdom/ForEveryone.Kingdom.Api
dotnet run --project src/Services/Shop/ForEveryone.Shop.Api
(Las migraciones de la base de datos se aplicarán automáticamente al arrancar en modo Development).

4. Configurar Frontend (React)
Navega a la carpeta del frontend y crea un archivo .env con las URLs de tus APIs locales:




Instala dependencias y ejecuta:

powershell

npm install
npm run dev
Abre tu navegador en http://localhost:5173 y ¡a jugar!

# 📂 Estructura de un Microservicio (Clean Architecture / DDD)
Cada microservicio sigue la misma estructura de capas estricta:



ForEveryone.[Service].Api              -> Controladores, Program.cs, Configuración DI
ForEveryone.[Service].Application     -> Casos de uso (Commands/Queries), MediatR, DTOs, Interfaces
ForEveryone.[Service].Infrastructure  -> EF Core, Repositorios, HttpClient, Migraciones
ForEveryone.[Service].Domain           -> Aggregate Roots, Value Objects, Domain Services, Reglas de Negocio
# 🗺️ Roadmap
 MVP de Autenticación (Identity)
 Combate y Subida de Nivel (Heroes)
 Gestión de Recursos y Edificios (Kingdom)
 Sistema de Ejército y Poder Militar (Kingdom)
 Tienda e Inventario (Shop + Heroes)
 Combate PvP (Asedios entre Reinos)
 Dockerización y despliegue en la nube (Render/Vercel)