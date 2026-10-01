# Foreveryone — Frontend

SPA del juego de gestión de reino. React 19, TypeScript, Vite, React Router, Axios y CSS
sin framework. Habla directamente con los cuatro microservicios del backend; no hay gateway.

## Puesta en marcha

El frontend necesita los cuatro APIs encendidos. El script de la raíz del repositorio los
levanta todos junto con Vite:

```powershell
.\start-all.ps1
```

Si se arranca solo el frontend:

```powershell
npm install
npm run dev
```

Vite está fijado al puerto **5173** con `strictPort`: si el puerto está ocupado avisa en lugar
de mudarse al 5174, porque el CORS del backend solo permite el origen 5173.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con HMR en el puerto 5173. |
| `npm run lint` | ESLint sobre todo el proyecto. |
| `npm run build` | `tsc -b` (con `strict`) y después el bundle de producción en `dist/`. |
| `npm run preview` | Sirve el resultado de `build` para comprobarlo antes de publicar. |

No hay suite de tests automatizados en el frontend.

## Configuración

Las URLs de los servicios salen de variables de entorno `VITE_*` de `.env`:

| Variable | Servicio | Puerto por defecto |
| --- | --- | --- |
| `VITE_IDENTITY_URL` | Identity | 5045 |
| `VITE_HEROES_URL` | Heroes | 5281 |
| `VITE_KINGDOM_URL` | Kingdom | 5256 |
| `VITE_SHOP_URL` | Shop | 4136 |

Vite solo expone al navegador las variables con prefijo `VITE_`. Si alguna falta, `src/api/api.ts`
cae al puerto de la tabla, así que el `.env` es una comodidad, no un requisito.

## Estructura

```
src/
  api/
    api.ts        instancias de Axios, una por servicio, con el JWT inyectado
    errors.ts     extracción de mensajes: los servicios no comparten un formato de error
  auth/
    session.ts    decodifica el JWT en un UserSession y comprueba la caducidad
    token.ts      único punto de lectura y escritura del token en localStorage
  components/     componentes de UI, cada uno con su CSS junto al .tsx
  i18n/           idioma y tema: diccionarios, providers, hooks y persistencia
  pages/          rutas: HeroPage, CastlePage, ShopPage, NotFoundPage
  assets/         recursos estáticos
  types.ts        formas de los DTOs que devuelve el backend
```

Los estilos se reparten así:

- `App.css` solo tiene los tokens de tema, el reset del body y el layout raíz.
- `index.css` se mantiene mínimo a propósito.
- Cada componente y página lleva su CSS en un archivo contiguo con el mismo nombre.
- `GameCard.css` recoge las reglas de tarjeta que comparten varias pantallas.

## Idioma y tema

La interfaz está en castellano e inglés, y el jugador elige ambos desde el selector de la
esquina superior derecha, disponible también antes de iniciar sesión.

- **Idioma.** En la primera visita se deduce de `navigator.languages`; en cuanto el jugador elige,
  su preferencia gana y se guarda. Los dos diccionarios viven juntos en `src/i18n/dictionaries.ts`
  porque las claves del servidor y las del cliente se mezclan en los mensajes de combate.
  El inglés está tipado contra el castellano, así que añadir un texto en un idioma y olvidarlo en
  el otro falla al compilar en lugar de dejar un texto suelto en la interfaz.
- **Textos del servidor.** El backend no redacta frases: devuelve la clave del mensaje y los
  argumentos ya resueltos. Cuando un argumento es a su vez texto traducible (el nombre de una
  habilidad o de un enemigo) viaja como clave, en un argumento terminado en `Key`, y el cliente
  lo traduce antes de insertarlo. Así un mismo combate se cuenta en los dos idiomas.
- **Tema.** Oscuro por defecto, con el tema claro manteniendo el ADN medieval: mismo oro, misma
  tipografía, sombras más suaves y superficies claras. El tema claro solo redefine los tokens de
  `App.css`, así que ningún componente sabe qué tema hay activo. La preferencia se respeta por
  encima de `prefers-color-scheme`, y el atributo `data-theme` se aplica antes de montar React
  para que recargar en claro no produzca un destello.

Añadir un texto nuevo obliga a tocar `dictionaries.ts` en los dos idiomas y, si lo emite el
servidor, a usar `LocalizedText` en lugar de una frase.

## Notas de implementación

- **Identidad.** El token se guarda en `localStorage` y `App.tsx` es su único escritor;
  `src/auth/token.ts` centraliza el acceso y el interceptor de Axios solo lee. `AuthSession`
  se decodifica del JWT y se pasa a las páginas por el contexto del outlet de React Router,
  not por props duplicadas.
- **Errores.** Los cuatro servicios no devuelven el mismo cuerpo: Identity usa
  `ProblemDetails` con la clave de traducción en `message`, Heroes, Kingdom y Shop devuelven
  `{ "detail": { "key": …, "args": … } }`, y los `NotFound()` sin cuerpo se reescriben a un
  `ProblemDetails` genérico sin mensaje. `src/api/errors.ts` normaliza los cuatro casos,
  traduce la clave y nunca muestra trazas de pila. Es el único sitio que lee el cuerpo de un
  error: ningún componente debe tocar `error.response.data`.
- **GameGate.** Antes de entrar al juego solo se consulta Heroes. Un 404 significa "todavía no
  tienes héroe" y abre el asistente de creación; no se llama a Identity porque eso ataba el
  login a un segundo servicio.
- **Balance en el servidor.** Razas, clases, enemigos y acciones de combate se piden a
  `GET /api/heroes/options` y `GET /api/heroes/enemies`. El cliente no duplica esos números.
