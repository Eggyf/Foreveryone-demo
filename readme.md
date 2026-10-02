# 🛡️ Foreveryone

Foreveryone es un RPG web de gestión y progresión idle (*management/idle game*). Los jugadores pueden registrarse, crear héroes, combatir, fundar reinos, producir recursos, mejorar edificios, entrenar tropas y comprar equipo.

El repositorio contiene una SPA React y cuatro servicios ASP.NET Core independientes. Cada servicio aplica una separación por contextos con capas `Api`, `Application`, `Domain` e `Infrastructure`, y utiliza su propio contexto de persistencia PostgreSQL.

> **Estado actual:** el proyecto es un MVP funcional en desarrollo. El backend y el frontend compilan, pero la aplicación todavía no debe exponerse públicamente sin resolver la autenticación/autorización, la configuración de producción y los riesgos descritos más abajo.

## 📑 Tabla de contenido

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Estructura del repositorio](#-estructura-del-repositorio)
- [Requisitos previos](#-requisitos-previos)
- [Configuración local](#-configuración-local)
  - [1. Crear las bases de datos](#1-crear-las-bases-de-datos)
  - [2. Configurar las APIs](#2-configurar-las-apis)
  - [3. Ejecutar el backend](#3-ejecutar-el-backend)
  - [4. Ejecutar el frontend](#4-ejecutar-el-frontend)
- [Endpoints principales](#-endpoints-principales)
- [Comandos útiles](#-comandos-útiles)
- [Agentes de OpenCode](#-agentes-de-opencode)
- [Estado y limitaciones conocidas](#-estado-y-limitaciones-conocidas)
- [Solución de problemas](#-solución-de-problemas)
- [Roadmap](#-roadmap)

## ✨ Características

- Registro e inicio de sesión con JWT, usando nombre de usuario o email.
- Elección de raza y clase obligatoria antes de entrar al juego.
- Creación de héroes de cuatro clases combinables con cuatro razas.
- Combate por turnos con daño basado en ataque y defensa.
- Experiencia, niveles y estadísticas permanentes.
- Descanso y recuperación de vida.
- Creación y gestión de reinos.
- Producción pasiva de recursos basada en tiempo, con un máximo de dos horas acumulables.
- Construcción y mejora de edificios.
- Entrenamiento de soldados y cálculo de poder militar.
- Catálogo de objetos y compras que modifican al héroe.
- Swagger/OpenAPI disponible para cada API en el entorno de desarrollo.

## 🏛️ Arquitectura

```mermaid
flowchart LR
    FE[React + TypeScript]

    FE --> ID[Identity API]
    FE --> H[Heroes API]
    FE --> K[Kingdom API]
    FE --> S[Shop API]

    H --> ID
    H --> S
    K --> ID

    ID --> IDB[(Identity PostgreSQL)]
    H --> HB[(Heroes PostgreSQL)]
    K --> KB[(Kingdom PostgreSQL)]
    S --> SB[(Shop PostgreSQL)]
```

### Microservicios

| Servicio | Responsabilidad | Persistencia | Puerto HTTP local |
| --- | --- | --- | ---: |
| **Identity** | Registro, login, hash de contraseñas, emisión de JWT y verificación de usuarios | `IdentityDbContext` | `5045` |
| **Heroes** | Héroes, combate, experiencia, descanso, oro y compras | `HeroesDbContext` | `5281` |
| **Kingdom** | Reinos, recursos, edificios, mejoras y ejército | `KingdomDbContext` | `5256` |
| **Shop** | Catálogo de objetos y sus efectos | `ShopDbContext` | `5136` |

Los servicios se comunican de forma síncrona mediante HTTP. El frontend llama directamente a cada API; actualmente no existe un API Gateway.

### Capas de cada servicio

```text
ForEveryone.[Service].Api
├── Controllers
├── Program.cs y configuración de DI
└── Composition root

ForEveryone.[Service].Application
├── Commands y queries
├── MediatR
├── DTOs e interfaces
└── Validación

ForEveryone.[Service].Domain
├── Entidades y agregados
├── Value objects
└── Reglas de negocio

ForEveryone.[Service].Infrastructure
├── EF Core y DbContext
├── Repositorios
├── Clientes HTTP
└── Migraciones
```

`ForEveryone.SharedKernel` contiene abstracciones compartidas como `Entity`, `Result`, `Error`, comandos, queries y eventos de dominio. En la implementación actual, Identity es el servicio que utiliza de forma más consistente el Shared Kernel.

## 🛠️ Tecnologías

### Backend

- .NET 10
- ASP.NET Core Web API
- C#
- Entity Framework Core
- PostgreSQL mediante Npgsql
- MediatR
- FluentValidation
- JWT con `System.IdentityModel.Tokens.Jwt`
- PBKDF2-SHA256 para contraseñas
- Swagger/OpenAPI

### Frontend

- React 19
- TypeScript 6
- Vite 8
- React Router DOM 7
- Axios
- CSS puro con tema dark fantasy
- ESLint

## 📂 Estructura del repositorio

```text
Foreveryone/
├── .agents/
│   └── skills/                        # Skills de agentes
├── .opencode/
│   └── agents/                       # Agentes de OpenCode
├── ForEveryone - backend/
│   ├── .dockerignore
│   ├── ForEveryone.slnx
│   ├── docker/
│   │   └── Dockerfile                 # imagen común a las cuatro APIs
│   ├── setup-shop.ps1
│   ├── start-all.ps1                     # reenvía al de la raíz
│   └── src/
│       ├── BuildingBlocks/
│       │   └── ForEveryone.SharedKernel/
│       └── Services/
│           ├── Identity/
│           ├── Heroes/
│           ├── Kingdom/
│           └── Shop/
├── .env.example                       # plantilla de credenciales (versionada)
├── docker-compose.yml                 # las 4 BBDD + las 4 APIs
├── start-all.cmd                      # doble clic: lanza Docker Compose y el frontend
├── start-all.ps1                      # lo mismo, para invocar desde una terminal
├── foreveryone-frontend/
│   ├── src/
│   │   ├── api/          # instancias de Axios y extracción de errores
│   │   ├── auth/         # decodificación del JWT y acceso al token
│   │   ├── components/   # componentes de UI, con su CSS contiguo
│   │   ├── pages/        # rutas de la SPA
│   │   ├── App.tsx
│   │   └── types.ts
│   ├── package.json
│   └── vite.config.ts
└── readme.md
```

> El `.env` de la raíz no aparece porque **no se versiona**: contiene las
> passwords de las bases de datos y el secreto de firma de los JWT. Se genera
> a partir de `.env.example`.

## ✅ Requisitos previos

- [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/) con Docker Compose v2 o superior. Aporta PostgreSQL y las cuatro APIs, así que **no hace falta instalar PostgreSQL ni el .NET SDK** para levantar el entorno.
- [Node.js](https://nodejs.org/) `^20.19.0` o `>=22.12.0` y npm, solo para el frontend, que sigue ejecutándose en local.
- PowerShell si se desea ejecutar `start-all.ps1`.

Comprueba las versiones instaladas:

```powershell
docker --version
docker compose version
node --version
npm --version
```

El [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) ya no es necesario para levantar el entorno, porque las cuatro APIs se compilan dentro de Docker. Sigue siendo útil para iterar sobre el backend sin Docker o para abrir la solución en un IDE.

## ⚙️ Configuración local

### 1. Crear el `.env` de credenciales

Las cuatro bases de datos y las cuatro APIs arrancan en Docker. El `docker-compose.yml` de la raíz lee de un `.env` las passwords y el secreto de firma de los JWT, que **no se versionan**.

Cópialo de la plantilla una sola vez:

```powershell
copy .env.example .env
```

Y sustituye cada valor por uno propio. Docker Compose se niega a arrancar si falta cualquiera de ellos, en vez de crear bases con una password por defecto compartida.

> Cambiar la password de una base que **ya tiene datos** no hace nada: el volumen
> sigue guardando la password con la que se inicializó. O dejas la variable como
> estaba cuando se creó el volumen, o ejecutas `docker compose down -v` para
> empezar de cero.

### 2. Levantar las bases de datos y las APIs

El proyecto usa un contexto y una base de datos por servicio. Las cuatro se crean solas al arrancar: `docker-compose.yml` declara un contenedor PostgreSQL por servicio y un volumen para cada uno.

```powershell
docker compose up -d
```

La primera vez compila las cuatro imágenes de las APIs, y puede tardar varios minutos. Las siguientes reutilizan la imagen ya construida.

| Contenedor | Base de datos | Puerto en el host |
|---|---|---|
| `identity-db` | `foreveryone_identity` | `5432` |
| `heroes-db` | `foreveryone_heroes` | `5433` |
| `kingdom-db` | `foreveryone_kingdom` | `5434` |
| `shop-db` | `foreveryone_shop` | `5435` |
| `identity-api` | — | `5045` |
| `heroes-api` | — | `5281` |
| `kingdom-api` | — | `5256` |
| `shop-api` | — | `4136` |

Los puertos de las APIs no han cambiado, salvo Shop. El `5136` cae dentro del rango `5071-5170` que Windows reserva (visible en `netsh interface ipv4 show excludedportrange protocol=tcp`), y en un puerto excluido ni Docker puede publicar ni ASP.NET puede escuchar. Shop se mueve por eso al `4136`, tanto dentro del contenedor como en el host, y `foreveryone-frontend/.env` apunta allí. Para volver al `5136`, libera ese rango reservado y ajusta a la vez `docker-compose.yml` y el `.env` del frontend.

Cada API aplica sus migraciones pendientes al arrancar, y solo lo hace porque el compose fija `ASPNETCORE_ENVIRONMENT=Development` en las cuatro. Cada API espera a que su base de datos esté `healthy` (comprobado con `pg_isready`) antes de arrancar, para que la migración no compita con el arranque de PostgreSQL. Fuera de `Development`, las migraciones deben ejecutarse como parte de un proceso explícito de despliegue.

Comandos habituales:

```powershell
docker compose ps                 # estado y salud de cada contenedor
docker compose logs -f heroes-api # seguir el log de un servicio
docker compose restart heroes-api # reiniciar solo una API
docker compose up -d --build      # recompilar las imágenes y recrear
docker compose down               # parar, conservando los datos
docker compose down -v            # parar y borrar también las bases de datos
```

> `down -v` destruye los volúmenes, y con ellos las cuentas, héroes, reinos y partidas. Es la forma de empezar de cero cuando una migración deja el esquema inconsistente.

#### Sobre las URLs entre servicios

Heroes llama a Identity y a Shop, y Kingdom llama a Identity. Dentro de un contenedor, `localhost` sería la propia API, así que el compose les da la URL del otro servicio por su nombre en la red:

```yaml
IdentityServiceUrl: "http://identity-api:5045/"
```

Esas variables **no son opcionales**: el código las lee con `!` (`null-forgiving`), que solo silencia al aviso del compilador. Si faltan, `new Uri(null)` hace fallar el arranque del contenedor.

#### Script de arranque

En la raíz del repositorio hay dos archivos para levantar el proyecto. **Doble clic en `start-all.cmd`**, o desde una terminal:

```powershell
.\start-all.cmd                # 4 APIs + 4 bases de datos en Docker, y Vite en 5173
.\start-all.cmd -Rebuild       # además recompila las imágenes de las APIs
.\start-all.cmd -Stop          # para todo, conservando los datos
.\start-all.cmd -NoBrowser     # no abre el navegador al terminar
```

> El script comprueba que Docker responde, que Node.js está instalado y que el `.env` existe antes de tocar nada; instala las dependencias del frontend si falta `node_modules`; levanta Compose; espera a que **cada API responda por HTTP** (no solo a que abra el puerto: Docker abre el socket antes de que ASP.NET sirva los endpoints) y a que Vite atienda en 5173. Si un puerto ya está ocupado, indica qué proceso lo tiene con su PID y lo reutiliza en vez de esperar. Al final imprime las URLs y abre el navegador.

#### Por qué hay un `.cmd` y un `.ps1`

Porque hacer doble clic en un `.ps1` no funciona con la configuración por defecto de Windows. El menú contextual ejecuta `powershell.exe -file <script>` **sin** `-ExecutionPolicy`, y con la política de ejecución en `Restricted` —el valor por defecto, y el que tiene esta máquina— Windows rechaza el archivo antes de leer la primera línea. La ventana aparece, suelta el error y se cierra, lo que parece un fallo del script cuando en realidad nunca llegó a arrancar.

Un `.cmd` no pasa por el motor de PowerShell, así que `start-all.cmd` se ejecuta siempre: delega en `start-all.ps1` con `-ExecutionPolicy Bypass`, que vale solo para esa llamada y **no cambia la política de la máquina**. Si prefieres no tener dos archivos, relajar la política para tu usuario lo resuelve también:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Con `RemoteSigned` los scripts locales se ejecutan sin más y solo los descargados exigen firma. Es un cambio de configuración del sistema, así que no lo hace el repositorio por ti.

El `start-all.ps1` que quedaba en `ForEveryone - backend/` ahora solo reenvía al de la raíz, para no tener dos copias que se desincronicen. La razón del traslado: el antiguo esperaba a Shop en el 5136, que ya no existe (ver la nota de puertos más abajo), así que se quedaba 90 segundos esperando un puerto que nunca iba a abrir.

#### Trabajar sobre el backend sin Docker

Las APIs se pueden seguir levantando en local con el SDK de .NET, contra las bases de datos que publican los contenedores. Al estar en Docker, los puertos son los de la tabla anterior:

```powershell
dotnet restore ForEveryone.slnx
dotnet build ForEveryone.slnx --no-restore
dotnet run --project src/Services/Identity/ForEveryone.Identity.Api --launch-profile http
```

En este caso las APIs necesitan su configuración en **.NET User Secrets**, que Compose no inyecta:

```powershell
Push-Location src/Services/Identity/ForEveryone.Identity.Api
dotnet user-secrets set "ConnectionStrings:IdentityDb" "Host=localhost;Port=5432;Database=foreveryone_identity;Username=postgres;Password=TU_PASSWORD"
dotnet user-secrets set "Jwt:Secret" "CAMBIAR_POR_UN_SECRETO_LARGO_Y_ALEATORIO"
Pop-Location
```

Lo mismo para `HeroesDb` en Heroes, `KingdomDb` en Kingdom y `ShopDb` en Shop, más `IdentityServiceUrl` y `ShopServiceUrl` en Heroes y `IdentityServiceUrl` en Kingdom, esta vez apuntando a `http://localhost:<puerto>/` porque ya no hay red de Docker de por medio.

### 4. Ejecutar el frontend

Desde la raíz del repositorio:

```powershell
cd foreveryone-frontend
npm ci
npm run dev
```

Abre:

```text
http://localhost:5173
```

El frontend toma las URLs de los servicios de las variables `VITE_*` de `foreveryone-frontend/.env`, que se leen desde `import.meta.env` en `src/api/api.ts`. Si alguna no está definida se usa el puerto local por defecto (5045, 5281, 5256 y 5136), así que el `.env` es una comodidad y no un requisito.

## 🔌 Endpoints principales

### Identity — `http://localhost:5045`

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Registra un usuario |
| `POST` | `/api/auth/login` | Inicia sesión y devuelve un JWT |
| `GET` | `/internal/users/{id}/exists` | Comprueba la existencia de un usuario |

Cuerpos de	request y respuestas:

```jsonc
// POST /api/auth/register
// { "username": "ainz.ooal", "email": "gmail@example.com", "password": "Password1" }
// 201 -> { "userId": "...", "username": "ainz.ooal", "email": "gmail@example.com" }

// POST /api/auth/login
// { "identifier": "ainz.ooal", "password": "Password1" }
// 200 -> { "token": "...", "userId": "...", "username": "ainz.ooal", "email": "gmail@example.com" }
```

`identifier` admite email o nombre de usuario. El backend decide cuál usar según
el formato recibido: si contiene `@` se busca por email, en caso contrario por
nombre de usuario. El nombre de usuario se normaliza a minúsculas, por lo que
`Ainz.Ooal` y `ainz.ooal` son la misma cuenta.

Reglas del nombre de usuario:

- Entre 3 y 24 caracteres.
- Solo letras, números, punto, guion y guion bajo.
- Debe empezar y terminar en letra o número.
- Es único y da lugar a un `409 Conflict` si ya está en uso.

El JWT incluye el claim estándar `preferred_username` con el nombre de usuario,
además de `sub` y `email`. El frontend lo decodifica en `UserSession` para mostrar
el nombre del jugador.

### Heroes — `http://localhost:5281`

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/heroes` | Crea un héroe con su raza y clase |
| `GET` | `/api/heroes/options` | Catálogo de razas y clases con sus estadísticas |
| `GET` | `/api/heroes/zones` | Zonas del mapa con sus enemigos, estadísticas y recompensas |
| `POST` | `/api/heroes/{userId}/battle` | Inicia un combate por turnos contra el enemigo del cuerpo |
| `POST` | `/api/heroes/{userId}/battle/{battleId}/turn` | Juega un turno eligiendo acción |
| `GET` | `/api/heroes/{userId}/battle` | Combate en curso, para poder retomarlo |
| `GET` | `/api/heroes/{userId}` | Obtiene el héroe de un usuario. Devuelve `404` si todavía no tiene |
| `POST` | `/api/heroes/{userId}/adventure` | Ejecuta una aventura |
| `POST` | `/api/heroes/{userId}/rest` | Recupera la vida del héroe |
| `GET` | `/api/shop` | Catálogo legado mantenido en Heroes |
| `POST` | `/api/shop/{userId}/buy` | Compra un objeto desde el servicio Heroes |

#### Creación del personaje

Tras iniciar sesión, un usuario sin héroe ve un asistente a pantalla completa
donde elige primero la raza y después la clase. La navegación del juego no
aparece hasta que el personaje existe. `GameGate` es el componente que hace
esta comprobación en el frontend: consulta únicamente a Heroes
(`GET /api/heroes/{userId}`) y deriva al asistente si responde `404`.

Deliberadamente **no** consulta a Identity en este punto. Hacerlo obligaba a que
el login dependiera de dos servicios a la vez, y cualquier fallo transitorio de
Identity bloqueaba el juego con un mensaje de sesión inválida justo después de
iniciar sesión. Si la cuenta realmente no existe, el propio `POST /api/heroes`
devuelve `404` y el asistente ofrece cerrar sesión.

```jsonc
// POST /api/heroes
// { "userId": "...", "race": 3, "class": 1 }
// 201 -> { "heroId": "...", "userId": "...", "race": "Enano", "class": "Warrior" }
```

Cada usuario tiene como máximo un héroe. La elección es inmutable: no existe
endpoint para cambiarla, y un segundo `POST` devuelve `409`.

**Estadísticas base por clase** (`ClassBonus.For`):

| Clase | Vida | Ataque | Defensa | Maná |
| --- | --- | --- | --- | --- |
| `Warrior` | 150 | 15 | 20 | 10 |
| `Hunter` | 100 | 20 | 10 | 20 |
| `Wizard` | 80 | 25 | 5 | 50 |
| `Rogue` | 90 | 18 | 12 | 15 |

**Modificadores por raza** (`RaceBonus.For`), en porcentaje sobre la clase:

| Raza | Vida | Ataque | Defensa | Maná |
| --- | --- | --- | --- | --- |
| `Humano` | 0% | 0% | 0% | 0% |
| `Elfo` | 0% | +10% | -10% | +10% |
| `Enano` | +20% | -10% | +20% | 0% |
| `Orco` | +15% | +15% | -15% | -20% |

El cálculo se aplica una sola vez, dentro del constructor de `Hero`, de modo
que ningún héroe puede existir sin el bonus de su raza. El porcentaje usa
división entera truncada hacia cero y nunca baja de 1 punto, así que un
penalizador no deja una estadística inutilizable.

Las dos tablas de balance viven solo en el dominio. El frontend las recibe de
`GET /api/heroes/options` y reproduce el mismo cálculo para la vista previa, en
lugar de duplicar los números.

#### Mapa y zonas

Los enemigos no están sueltos: cada uno pertenece a una zona, y las zonas viven
en el dominio igual que los enemigos. `ZoneCatalog` es la lista de zonas y
`EnemyCatalog` sigue siendo la lista plana de enemigos, ahora con un `ZoneKey`
que dice de dónde es cada uno. `ZoneCatalog.EnemiesIn` agrupa sin duplicar la
tabla: no hay una segunda lista de enemigos que se pueda desincronizar.

| Zona | Enemigos | Nivel recomendado |
| --- | --- | --- |
| Bosque de Ceniza | Goblin, Araña gigante, Treant | 1 |
| Cavernas Selladas | Murciélago gigante, Limo voraz, Troll | 3 |
| Ruinas de Valdoro | Esqueleto, Espectro, Golem de obsidiana | 5 |

Las **tres zonas están abiertas desde el principio**: no hay progreso que
guardar y por eso `StartBattle` no cambia. Sigue validando el enemigo con
`EnemyCatalog.FindByKey`, que es exactamente lo que hacía antes. El nivel
recomendado es información, no una cerradura — está en la zona para que un héroe
nuevo sepa que el Golem le gana de largo, no para impedirle entrar.

El endpoint es `GET /api/heroes/zones` y devuelve las zonas con sus enemigos
anidados, en el orden en que las presenta el mapa. Sustituye a
`GET /api/heroes/enemies`, que exponía los enemigos sin zona; mantener ambos
habría dejado dos contratos que divergir.

```jsonc
// GET /api/heroes/zones
// [{ "key": "forest", "nameKey": "zone.forest.name",
//    "descriptionKey": "zone.forest.desc", "recommendedLevel": 1,
//    "enemies": [{ "key": "goblin", "nameKey": "enemy.goblin", "health": 50,
//                  "attack": 12, "defense": 5,
//                  "experienceReward": 40, "goldReward": 20 }] }]
```

El texto llega como claves y lo compone el cliente, igual que el resto del
proyecto. El nombre y la descripción de una zona cuelgan del mismo prefijo
(`zone.forest.name` y `zone.forest.desc`) para que el cliente los guarde juntos.

#### Batallas por turnos

El combate vive en el servicio Heroes, no en un microservicio aparte. Es lógica
de dominio pura sobre las estadísticas que Heroes ya posee, así que separarla
añadiría una base de datos, migraciones, configuración de CORS y una latencia de
red en cada batalla sin aportar nada. Si el sistema crece (habilidades, botín,
mapa), el modelo está aislado en `BattleEngine` y `EnemyCatalog` para poder
extraerlo después.

**El jugador elige la acción en cada turno.** No hay una lista global de
habilidades: cada clase tiene **su propio kit de tres ranuras**, y el catálogo
`ClassAbilities` del dominio es la única fuente de ese balance.

| Ranura | Guerrero | Cazador | Mago | Pícaro |
| --- | --- | --- | --- | --- |
| `Attack` — siempre gratis e ilimitada | Golpe de espada ×1 | Disparo ×1 | Dardo arcano ×0.9 | Tajo ×1 |
| `PowerStrike` — característica de la clase | Estocada ×2 · 0 maná · 2 usos | Andanada ×1.8 · 25% maná · 2 usos | Bola de fuego ×2.4 · 40% maná · 2 usos | Ataque furtivo ×2.3 · 20% maná · 2 usos |
| `Special` — exclusiva de la clase | Guardia: mitad del daño de ese turno · 0 maná · 2 usos | Disparo perforante ×2.2 **ignorando la defensa** · 50% maná · 1 uso | Escudo arcano: cura 30% de la vida antes del contraataque · 60% maná · 1 uso | Sangre fría: ×2.4 y devuelve el 50% del daño como vida · 35% maná · 2 usos |

El primer turno de cada clase es siempre gratuito, así que nunca hay bloqueo, y
el multiplicador es un porcentaje del ataque: el daño final descuenta la defensa
del enemigo salvo en la habilidad perforante. El daño nunca baja de 1 punto, para
que un enemigo muy defensivo no eternice el combate, y no hay azar: el resultado
depende solo de las estadísticas, la clase y las acciones elegidas.

El **maná** se recupera un 20% del máximo al empezar cada turno y antes de pagar
el coste de la acción. Los costes van en porcentaje del maná máximo porque las
reservas son muy distintas (Guerrero 10, Mago 50): un coste absoluto dejaría al
Guerrero sin poder usar nunca su habilidad y al Mago usarla sin pensarlo. Como
el ataque básico no cuesta maná, la reserva nunca se queda atascada a cero.

Los límites de usos, el maná insuficiente y las habilidades que no son del kit
los comprueba **el servidor**, no el cliente. `BattleEngine.Unavailability`
devuelve el motivo en texto para que el panel muestre exactamente por qué un
botón está deshabilitado, y usar la habilidad de otra clase se rechaza como
petición inválida. El cliente no duplica ningún número: la respuesta incluye un
array `actions` con el nombre, la descripción, el daño exacto contra ese enemigo,
el coste en maná, los usos restantes y el motivo de bloqueo de cada habilidad.

Las habilidades de soporte (Guardia, Escudo arcano) no golpean, así que no pueden
rematar al enemigo: en esos turnos el enemigo no contraataca y el héroe recupera
el control del combate.

```jsonc
// POST /api/heroes/{userId}/battle                        -> inicia combate
// { "enemyKey": "treant" }

// POST /api/heroes/{userId}/battle/{battleId}/turn         -> juega un turno
// { "action": 2 }

// GET /api/heroes/{userId}/battle                          -> combate en curso, o 404
```

**El estado de la batalla se reconstruye, no se guarda turno a turno.** Como el
combate es determinista, la secuencia de acciones jugadas *es* el estado: la
tabla `Battles` solo guarda identificador, héroe, enemigo, esa secuencia en una
columna CSV, la vida y el maná con los que empezó, y el estado final. Así no existe forma de
que la partida guardada se desincronice del héroe, y `BattleEngine.Replay` queda
como una función pura, fácil de probar.

El daño se descuenta del héroe en cuanto ocurre cada turno, no al cerrar el
combate: abandonar la pelea a mitad también cuesta vida. Solo se admite un
combate abierto por héroe.

| Enemigo | Vida | Ataque | Defensa | Experiencia | Oro |
| --- | --- | --- | --- | --- | --- |
| `goblin` | 50 | 12 | 5 | 40 | 20 |
| `wolf` | 90 | 20 | 8 | 80 | 45 |
| `ogre` | 150 | 30 | 14 | 150 | 90 |

Un héroe derrotado responde `409` y no puede iniciar combate hasta descansar.

### Kingdom — `http://localhost:5256`

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/kingdoms` | Crea un reino |
| `GET` | `/api/kingdoms/{userId}` | Obtiene el reino y calcula recursos pendientes |
| `POST` | `/api/kingdoms/{userId}/buildings` | Construye un edificio |
| `POST` | `/api/kingdoms/{userId}/buildings/upgrade` | Mejora un edificio |
| `POST` | `/api/kingdoms/{userId}/army/train` | Entrena soldados |

### Shop — `http://localhost:5136`

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/shop` | Lista el catálogo |
| `GET` | `/api/shop/{id}` | Obtiene un objeto concreto |

### Swagger

En `Development`, la interfaz Swagger está disponible en:

```text
http://localhost:5045/swagger
http://localhost:5281/swagger
http://localhost:5256/swagger
http://localhost:5136/swagger
```

## 🧰 Comandos útiles

### Backend

```powershell
# Restaurar paquetes
dotnet restore ForEveryone.slnx

# Compilar
dotnet build ForEveryone.slnx --no-restore

# Publicar una API
dotnet publish src/Services/Heroes/ForEveryone.Heroes.Api -c Release
```

### Frontend

```powershell
# Instalar exactamente las versiones del lockfile
npm ci

# Servidor de desarrollo
npm run dev

# Comprobar ESLint
npm run lint

# Compilar TypeScript y Vite
npm run build

# Previsualizar el build
npm run preview
```

## 🤖 Agentes de OpenCode

El proyecto incluye agentes reutilizables en `.opencode/agents/`:

- `reviewer.md`: revisión sin acceso de edición.
- `tester.md`: pruebas, diagnóstico y verificación.
- `code-explorer.md`: análisis de arquitectura y código.
- `documentation-writer.md`: creación y mantenimiento de documentación.

Ejemplos de uso desde OpenCode:

```text
Usa el agente code-explorer para mapear el flujo de compra de la tienda.
```

```text
Usa el agente reviewer para revisar los cambios actuales sin modificar archivos.
```

## ⚠️ Estado y limitaciones conocidas

- **Autorización pendiente:** Identity emite JWT, pero Heroes, Kingdom y Shop no configuran actualmente `AddJwtBearer`, `UseAuthentication` ni `[Authorize]`. No confíes en el `userId` enviado por el cliente hasta resolverlo.
- **Endpoint interno público:** `/internal/users/{id}/exists` no requiere autenticación entre servicios.
- **Lint frontend limpio:** `npm run lint` pasa sin errores y `npm run build` compila con `strict` activado en TypeScript.
- **Formatos de error heterogéneos:** Identity devuelve `ProblemDetails` (`detail`/`title`), mientras que Heroes, Kingdom y Shop devuelven `{ "message": … }`. Los `NotFound()` sin cuerpo se reescriben a un `ProblemDetails` genérico sin `message` ni `detail`, así que el frontend decide por código de estado y no por cuerpo. `src/api/errors.ts` normaliza los cuatro casos; conviene unificar el contrato en el backend.
- **Sin pruebas automatizadas:** no hay proyectos de tests .NET ni una suite de frontend.
- **Sin CI/CD ni contenedores:** todavía no hay Dockerfiles, Docker Compose ni workflows de despliegue.
- **Sin health checks ni observabilidad:** no hay endpoints de salud, métricas, trazas distribuidas ni correlación de requests.
- **Manejo global de errores pendiente:** algunos errores de dominio pueden terminar como respuestas HTTP 500. En Heroes solo se traducen `NotFoundException`, `ConflictException` y `ValidationException` desde los controladores; otras excepciones, como la falta de oro en una compra, siguen escapando sin manejar.
- **Concurrencia pendiente:** las operaciones de compra, recursos y entrenamiento no tienen tokens de concurrencia optimista.
- **CORS local:** los orígenes permitidos se configuran por servicio en `Cors:AllowedOrigins` dentro de `appsettings.json`. Por defecto se admiten `localhost` y `127.0.0.1` en los puertos `5173` y `5174`.

## 🛠️ Solución de problemas

### La API no encuentra una connection string

Verifica que estés ejecutando la API correcta y que el secreto exista. Ejecuta este comando desde el proyecto `.Api` correspondiente:

```powershell
dotnet user-secrets list
```

Los nombres de configuración son sensibles a mayúsculas y minúsculas.

### `new Uri(...)` falla al arrancar

Configura las URLs de servicios con una URL absoluta válida:

```text
IdentityServiceUrl=http://localhost:5045/
ShopServiceUrl=http://localhost:5136/
```

### Error de conexión con PostgreSQL

Lo primero es mirar el estado real de los contenedores:

```powershell
docker compose ps
docker compose logs heroes-api
```

Si un contenedor de base de datos aparece como `unhealthy` o `restarting`, el log suele decir que la password no coincide. Suele significar que el `.env` se editó **después** de que el volumen se creara: PostgreSQL solo aplica `POSTGRES_PASSWORD` la primera vez que inicializa el volumen, y a partir de ahí la contraseña guardada es la original. La solución es devolver la variable a su valor anterior, o `docker compose down -v` para empezar de cero.

Comprueba además que:

1. Docker Desktop esté arrancado.
2. El `.env` exista en la raíz del repositorio y tenga los cinco valores.
3. La API esté usando el nombre del servicio como host (`Host=heroes-db`), no `localhost`.
4. El firewall permita conexiones locales a los puertos publicados de las bases de datos (`5432` a `5435`).
5. La API esté ejecutándose con `ASPNETCORE_ENVIRONMENT=Development` si esperas que aplique migraciones.

> Si cambiaste el `.env` y el comportamiento no cambia, no basta con volver a aplicarlo: los contenedores conservan las variables del momento en que arrancaron. Usa `docker compose up -d --force-recreate`.

### CORS desde el frontend

Los orígenes permitidos se leen de `Cors:AllowedOrigins` en el `appsettings.json` de cada API. Por defecto se admiten `localhost` y `127.0.0.1` en los puertos `5173` y `5174`:

```jsonc
"Cors": {
  "AllowedOrigins": [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174"
  ]
}
```

Si el navegador muestra un error de CORS, comprueba primero en qué puerto está
sirviendo Vite. `foreveryone-frontend/vite.config.ts` fija el puerto `5173` con
`strictPort`, de modo que si está ocupado Vite avisa en lugar de arrancar en
otro puerto. Para permitir un origen adicional, edita la lista en el
`appsettings.json` del servicio correspondiente y reinícialo.

### La tienda no conecta con Shop

Verifica que Shop esté escuchando en `http://localhost:5136` y que `Heroes` tenga configurado:

```text
ShopServiceUrl=http://localhost:5136/
```

## 🗺️ Roadmap

1. Eliminar los errores de lint restantes y ampliar la cobertura de pruebas.
2. Implementar validación JWT y autorización en todos los servicios.
3. Obtener `userId` desde claims en lugar de confiar en el cuerpo o la URL.
4. Sustituir URLs fijas por configuración validada para Vite.
5. Unificar el contrato y el catálogo de Shop entre frontend, Heroes y Shop.
6. Añadir manejo global de errores y contratos `ProblemDetails`.
7. Crear pruebas unitarias, de integración y de contrato.
8. Añadir concurrencia optimista y límites de valores de dominio.
9. Incorporar health checks, logging estructurado y trazabilidad.
10. Dockerizar el sistema y definir un pipeline de CI/CD.
11. Completar la tienda y el inventario de objetos.
12. Evaluar combate PvP y asedios entre reinos.

---

Foreveryone es un proyecto activo y en evolución. Las funcionalidades no deben marcarse como aptas para producción hasta completar la autenticación, las pruebas y el endurecimiento operativo.
