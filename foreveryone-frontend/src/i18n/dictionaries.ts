/**
 * Diccionarios de traduccion de Foreveryone.
 *
 * Un solo archivo porque las claves del servidor y las del cliente conviven en el
 * mismo espacio: el servidor manda claves como `battle.round.struck` y aqui esta
 * su traduccion. Separarlos obligaria a saltar entre dos archivos cada vez que se
 * lee un mensaje de combate.
 *
 * El castellano es el idioma original del proyecto, asi que es el diccionario de
 * referencia: el ingles se declara con el mismo tipo, y el compilador obliga a que
 * tenga exactamente las mismas claves. Anadir un texto en un idioma y olvidarlo en
 * el otro es un error de compilacion, no un texto en castellano que aparece a
 * mitad de la interfaz inglesa.
 *
 * Los objetos se declaran anidados porque se leen mejor, pero se aplanan con
 * punto para poder buscarlos con una cadena.
 */

/** Valores admitidos en un argumento: texto ya resuelto o numero del servidor. */
export type MessageArg = string | number;

export type Messages = Record<string, string>;

/** Tipo del diccionario anidado de entrada, sin aplanar. */
type Nested = { [key: string]: string | Nested };

const flatten = (source: Nested, prefix = ''): Messages => {
  const flat: Messages = {};

  for (const [key, value] of Object.entries(source)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      flat[path] = value;
    } else {
      Object.assign(flat, flatten(value, path));
    }
  }

  return flat;
};

/**
 * Castellano. Origen de todas las claves del proyecto.
 *
 * Las claves literales que el servidor mandaverbatim (por ejemplo
 * `battle.validation.userRequired`) se repiten aqui como su propia traduccion:
 * el servidor no traduce, solo nombra.
 */
const spanishSource = {
  app: {
    welcome: 'Bienvenido a Foreveryone',
    settings: 'Preferencias',
    language: 'Idioma',
    theme: 'Tema',
    themeDark: 'Oscuro',
    themeLight: 'Claro',
  },

  nav: {
    label: 'Navegación principal',
    hero: 'Héroe',
    castle: 'Castillo',
    shop: 'Tienda',
    logout: 'Salir',
  },

  auth: {
    login: 'Login',
    register: 'Registro',
    enter: 'Entrar',
    registerAction: 'Registrarse',
    waiting: 'Un momento…',
    identifierPlaceholder: 'Email o usuario',
    usernamePlaceholder: 'Nombre de usuario',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Contraseña',
    usernameHint: 'De 3 a 24 caracteres. Letras, números, punto, guion y guion bajo.',
    usernamePatternTitle:
      'De 3 a 24 caracteres, empezando y terminando en letra o número. Solo letras, números, punto, guion y guion bajo.',
    registerSuccess: '¡Registro exitoso! Ya puedes entrar como "{username}".',
    genericError: 'No se pudo completar la operación.',
  },

  gate: {
    searching: 'Buscando tu destino en Foreveryone…',
    invalidSession:
      'Tu sesión no es válida o ha caducado. Inicia sesión de nuevo para continuar.',
    backToLogin: 'Volver al login',
    checkFailed:
      'No se pudo comprobar si ya tienes personaje. Comprueba que los servicios estén encendidos.',
    retry: 'Reintentar',
  },

  creation: {
    title: 'Crea tu personaje',
    subtitle: 'Foreveryone necesita un héroe. Elige primero tu raza y después tu clase.',
    stepsLabel: 'Progreso de creación',
    stepRace: 'Elige tu raza',
    stepClass: 'Elige tu clase',
    manaLabel: 'Maná',
    health: 'Vida',
    attack: 'Ataque',
    defense: 'Defensa',
    mana: 'Maná',
    gold: 'Oro',
    // Abreviaturas de las tarjetas: caben cuatro modificadores en una fila y la
    // palabra completa no deja sitio para la cifra.
    attackShort: 'Atq',
    defenseShort: 'Def',
    summoning: 'Invocando el destino…',
    welcome: 'Bienvenido, {name}',
    changeRace: 'Cambiar raza',
    continueToClass: 'Continuar con la clase',
    creatingCharacter: 'Creando personaje…',
    enterGame: 'Entrar en Foreveryone',
    loadError: 'No se pudieron cargar las razas y clases.',
    createError: 'No se pudo crear tu personaje.',
    accountGone:
      'Tu cuenta ya no existe en el servidor. Vuelve a iniciar sesión o registra una cuenta nueva.',
    closeSession: 'Cerrar sesión',
  },

  hero: {
    cardLabel: 'Héroe de Foreveryone',
    portraitAlt: 'Retrato de {name}, {class}',
    level: 'Nv. {level}',
    health: 'Vida',
    healthLabel: 'Vida del héroe',
    statsLabel: 'Estadísticas del héroe',
    manaLabel: 'Maná',
    statusDefeated: 'Derrotado',
    statusRested: 'Descansado',
    statusReady: 'Listo para aventurearse',
    rest: 'Descansar',
    resting: 'Descansando…',
    visitShop: 'Visitar la tienda',
    loadingLabel: 'Cargando información del héroe',
    adventurer: 'Aventurero',
    heroFallback: 'Héroe',
    loadError: 'No se pudo cargar tu héroe.',
    refreshError: 'No se pudo actualizar la información del héroe.',
    restError: 'No se pudo descansar.',
    race: {
      humano: 'Humano',
      elfo: 'Elfo',
      enano: 'Enano',
      orco: 'Orco',
    },
    class: {
      warrior: 'Guerrero',
      hunter: 'Cazador',
      wizard: 'Mago',
      rogue: 'Pícaro',
    },
    specialty: {
      warrior: 'Especialista en combate cuerpo a cuerpo.',
      hunter: 'Experto en ataques a distancia.',
      wizard: 'Maestro de magia y poder arcano.',
      rogue: 'Acero veloz y golpes certeros.',
      fallback: 'Aventurero en servicio del reino.',
    },
    raceDescription: {
      humano: 'Versátil y sin debilidades marcados. Se adapta a cualquier clase.',
      elfo: 'Descendiente de los bosques: certero y mágico, pero frágil cuerpo a cuerpo.',
      enano: 'Fuerza desbordada y gran vitalidad, con menos defensa y menos maná.',
      orco: 'Fuerza desbordada y gran vitalidad, con menos defensa y menos maná.',
    },
    classDescription: {
      warrior: 'Especialista en combate cuerpo a cuerpo. Sin debilidades marcados.',
      hunter: 'Experto en ataques a distancia. Precisión y velocidad.',
      wizard: 'Maestro de la magia. Gran daño arcano a cambio de fragilidad.',
      rogue: 'Sombra letal. Equilibra daño y supervivencia con muy poco maná.',
    },
  },

  battle: {
    label: 'Batallas por turnos',
    title: 'Batallas',
    subtitle: 'Elige a tu rival. En cada turno decides cómo atacar.',
    logLabel: 'Turnos de la batalla',
    noEnemies: 'No hay rivales disponibles en este reino.',
    heroDefeated: 'Tu héroe está derrotado. Descansa para volver a luchar.',
    yourHero: 'Tu héroe',
    heroHealthLabel: 'Vida de tu héroe',
    heroManaLabel: 'Maná de tu héroe',
    turn: 'Turno {round}',
    victory: '¡Victoria!',
    defeat: 'Derrota',
    again: 'Volver a elegir rival',
    damageText: '{damage} de daño',
    noDamage: 'No hace daño',
    manaCost: '{cost} maná',
    noMana: 'Sin maná',
    uses: 'Usos: {left}/{limit}',
    exp: '{value} exp',
    gold: '{value} oro',
    loadError: 'No se pudieron cargar los enemigos.',
    startError: 'No se pudo iniciar el combate.',
    turnError: 'No se pudo jugar el turno.',
  },

  kingdom: {
    loading: 'Rastreando las tierras de tu reino…',
    loadError: 'No se pudo cargar tu reino.',
    notCreated: 'Aún no tienes un reino.',
    create: 'Fundar reino',
    creating: 'Fundando…',
    emptyTitle: 'Todavía no hay edificios',
    buildMenu: 'Amplía tu reino',
    build: 'Construir',
    building: 'Construido',
    upgrade: 'Mejorar',
    level: 'Nivel {level}',
    army: 'Ejército: {size}',
    armyLabel: 'Tus tropas',
    militaryPower: 'Poder militar: {power}',
    wood: 'Madera',
    stone: 'Piedra',
    food: 'Comida',
    training: 'Entrenar tropas',
    train: 'Entrenar {amount} tropas',
    soldiers: 'tropas',
    trainingInProgress: 'Entrenando…',
    needsBarracks: 'Construye un {barracks} para poder entrenar tropas.',
    created: 'Tu reino ha sido fundado.',
    built: '{building} construida.',
    upgraded: '{building} mejorada al nivel {level}.',
    actionError: 'No se pudo completar la acción.',
    resources: 'Recursos',
  },

  shop: {
    loading: 'Abriendo el puesto del mercader…',
    needsHero: 'Necesitas un héroe para entrar a la tienda.',
    loadHeroError: 'No se pudo cargar tu héroe.',
    loadCatalogError: 'No se pudo cargar el catálogo de la tienda.',
    title: 'Tienda de Foreveryone',
    gold: 'Oro: {value}',
    empty: 'El mercader no tiene nada preparado por ahora.',
    buy: 'Comprar',
    buying: 'Comprando…',
    buyError: 'No se pudo comprar el objeto.',
  },

  notFound: {
    title: 'Esta página no existe',
    back: 'Volver a mi héroe',
  },

  error: {
    brokenTitle: 'Algo se ha roto',
    brokenBody:
      'La vista actual no se ha podido dibujar. Puedes recargar la página para seguir jugando.',
    detailLabel: 'Detalle técnico',
    retry: 'Reintentar',
    reload: 'Recargar la página',
    closeSession: 'Cerrar sesión',
  },

  network: {
    down: 'No hay conexión con el servidor. Comprueba que los servicios estén encendidos.',
  },

  enemy: {
    goblin: 'Goblin',
    wolf: 'Lobo',
    ogre: 'Ogro',
  },

  building: {
    farm: { name: 'Granja', desc: 'Genera comida de forma pasiva para alimentar al reino.' },
    sawmill: { name: 'Aserradero', desc: 'Genera madera de forma pasiva para construir y mejorar.' },
    quarry: { name: 'Cantera', desc: 'Genera piedra de forma pasiva para construir y mejorar.' },
    market: { name: 'Mercado', desc: 'Genera oro de forma pasiva para financiar el reino.' },
    barracks: { name: 'Cuartel', desc: 'Permite entrenar soldados para defender el reino.' },
    castle: { name: 'Castillo', desc: 'La fortaleza del reino. No se puede construir a mano.' },
    fallback: 'Edificio',
    fallbackDesc: 'Edificio construido para el funcionamiento del reino.',
  },

  ability: {
    warrior: {
      attack: { name: 'Golpe de espada', desc: 'Ataque cuerpo a cuerpo básico.' },
      powerStrike: { name: 'Estocada', desc: 'Hundida certera que dobla el daño. Sin coste de maná.' },
      special: {
        name: 'Guardia',
        desc: 'Deja al descubierto: reduce a la mitad el daño de este turno.',
      },
    },
    hunter: {
      attack: { name: 'Disparo', desc: 'Disparo básico a distancia.' },
      powerStrike: { name: 'Andanada', desc: 'Dos flechas de una vez: daño por encima del doble.' },
      special: {
        name: 'Disparo perforante',
        desc: 'Ignora la defensa del enemigo y atraviesa su armadura.',
      },
    },
    wizard: {
      attack: { name: 'Dardo arcano', desc: 'Ataque mágico modesto, siempre disponible.' },
      powerStrike: { name: 'Bola de fuego', desc: 'Explosión devastadora. Consume bastante maná.' },
      special: {
        name: 'Escudo arcano',
        desc: 'No ataca: recupera vida antes de que el enemigo contraataque.',
      },
    },
    rogue: {
      attack: { name: 'Tajo', desc: 'Corte rápido básico.' },
      powerStrike: { name: 'Ataque furtivo', desc: 'Sale de la sombra y golpea sin avisar.' },
      special: { name: 'Sangre fría', desc: 'Roba vida al enemigo y se cura con una parte.' },
    },
  },

  shopItem: {
    sword: { name: '🗡️ Espada de Hierro', desc: 'Aumenta el Ataque +10 permanentemente.' },
    armor: { name: '🛡️ Armadura de Cuero', desc: 'Aumenta la Defensa +10 permanentemente.' },
    potion: { name: '🧪 Poción de Vida', desc: 'Restaura toda tu vida al instante.' },
  },

  // --- Claves que emite el servidor ---

  'battle.round.struck':
    'Turno {round}: {ability} hace {heroDamage} de daño. {enemy} responde con {enemyDamage}. Tu vida: {heroHealth}.',
  'battle.round.guarded':
    'Turno {round}: {ability} y el golpe de {enemy} rebota: {enemyDamage} de daño. Tu vida: {heroHealth}.',
  'battle.round.healed':
    'Turno {round}: {ability} recupera vida antes del contraataque. {enemy} responde con {enemyDamage}. Tu vida: {heroHealth}.',
  'battle.round.drained':
    'Turno {round}: {ability} hace {heroDamage} de daño y le roba vida. {enemy} responde con {enemyDamage}. Tu vida: {heroHealth}.',
  'battle.round.enemyDefeated':
    'Turno {round}: {ability} hace {heroDamage} de daño. ¡{enemy} ha caído!',

  'battle.outcome.victory':
    '¡Victoria contra {enemy}! Ganaste {experienceGained} de experiencia y {goldGained} de oro.',
  'battle.outcome.defeat': 'Has sido derrotado por {enemy}. Tu héroe necesita descansar.',

  'battle.turn.prompt': 'Turno {round}: elige cómo atacar.',

  'battle.blocked.notInKit': 'Tu clase no tiene esa habilidad.',
  'battle.blocked.noUsesLeft': 'No te quedan usos de {ability}.',
  'battle.blocked.manaTooLow':
    'Necesitas {cost} de maná para {ability} y solo tienes {have}.',

  'battle.error.noneInProgress': 'No tienes ningún combate en curso.',
  'battle.error.notFound': 'El combate no existe.',
  'battle.error.enemyNotFound': 'Ese enemigo no existe en este reino.',
  'battle.error.alreadyInProgress': 'Ya tienes un combate en curso.',
  'battle.error.alreadyFinished': 'El combate ya ha terminado.',
  'battle.error.heroDefeated': 'Tu héroe está derrotado. ¡Debe descansar antes de luchar!',

  'battle.validation.userRequired': 'El identificador de usuario es obligatorio.',
  'battle.validation.invalidBattle': 'El combate no es válido.',
  'battle.validation.invalidAction': 'La acción no es válida.',
  'battle.validation.enemyRequired': 'Debes indicar contra qué enemigo luchas.',

  'hero.error.notFound': 'Héroe no encontrado.',
  'hero.error.defeated': 'Tu héroe está derrotado. ¡Debe descansar antes de aventurarse!',
  'hero.error.alreadyHasHero': 'El usuario ya posee un héroe.',
  'hero.error.userMissingInIdentity': 'El usuario no existe en el sistema de Identity.',

  'hero.validation.invalidRace': 'La raza no es válida.',
  'hero.validation.invalidClass': 'La clase de héroe no es válida.',

  'hero.message.rested': 'Tu héroe ha descansado y recuperado su vida.',

  'kingdom.error.notFound': 'El usuario no tiene un reino.',
  'kingdom.error.userMissingInIdentity': 'El usuario no existe en el sistema de Identity.',
  'kingdom.error.alreadyHasKingdom': 'El usuario ya posee un reino.',
  'kingdom.error.needsBarracks': 'Necesitas construir un Cuartel primero.',
  'kingdom.error.notEnoughToTrain': 'Oro o Comida insuficientes para entrenar tropas.',
  'kingdom.error.armyAmountMustBePositive':
    'La cantidad a entrenar debe ser mayor a 0.',
  'kingdom.error.buildingNotBuilt': 'No tienes ese edificio construido.',
  'kingdom.error.notEnoughToUpgrade': 'Recursos insuficientes para mejorar el edificio.',
  'kingdom.error.buildingAlreadyExists':
    'Ya existe un edificio de este tipo en el reino.',
  'kingdom.error.notEnoughToBuild': 'Recursos insuficientes para construir.',
  'kingdom.error.notEnoughResources': 'Recursos insuficientes.',

  'kingdom.message.troopsTrained': 'Tropas entrenadas con éxito.',

  'shop.error.itemNotFound': 'El objeto no existe en la tienda.',
  'shop.error.notEnoughGold': 'Oro insuficiente para comprar este objeto.',
  'shop.error.invalidRequest': 'No se pudo procesar la compra.',
  'shop.message.purchaseSuccess': '¡Compra exitosa!',

  'auth.error.emailEmpty': 'El email no puede estar vacío.',
  'auth.error.emailTooLong': 'El email es demasiado largo.',
  'auth.error.emailInvalid': 'El formato del email no es válido.',
  'auth.error.usernameEmpty': 'El nombre de usuario no puede estar vacío.',
  'auth.error.usernameTooShort':
    'El nombre de usuario debe tener al menos 3 caracteres.',
  'auth.error.usernameTooLong':
    'El nombre de usuario no puede superar los 24 caracteres.',
  'auth.error.usernamePattern':
    'El nombre de usuario solo admite letras, números, punto, guion y guion bajo, y debe empezar y terminar en letra o número.',
  'auth.error.emailAlreadyInUse': 'Ya existe una cuenta con este email.',
  'auth.error.usernameAlreadyInUse': 'Ya existe una cuenta con este nombre de usuario.',
  'auth.error.userNotFound': 'El usuario no existe.',
  'auth.error.invalidCredentials':
    'Email, nombre de usuario o contraseña incorrectos.',
  'auth.error.accountInactive': 'La cuenta está desactivada.',

  'auth.validation.usernameRequired': 'El nombre de usuario es obligatorio.',
  'auth.validation.usernameTooShort':
    'El nombre de usuario debe tener al menos 3 caracteres.',
  'auth.validation.usernameTooLong':
    'El nombre de usuario no puede superar los 24 caracteres.',
  'auth.validation.usernamePattern':
    'El nombre de usuario solo admite letras, números, punto, guion y guion bajo, y debe empezar y terminar en letra o número.',
  'auth.validation.emailRequired': 'El email es obligatorio.',
  'auth.validation.emailInvalid': 'El formato del email no es válido.',
  'auth.validation.passwordRequired': 'La contraseña es obligatoria.',
  'auth.validation.passwordTooShort': 'La contraseña debe tener al menos 8 caracteres.',
  'auth.validation.passwordNeedsUppercase':
    'La contraseña debe tener al menos una mayúscula.',
  'auth.validation.passwordNeedsDigit': 'La contraseña debe tener al menos un número.',
  'auth.validation.identifierRequired': 'El email o nombre de usuario es obligatorio.',
  'auth.validation.identifierTooLong':
    'El email o nombre de usuario es demasiado largo.',
} satisfies Nested;

/**
 * Tipo con todas las claves del castellano. Es lo que obliga al ingles a tener
 * las mismas: si aqui falta una clave, el compilador lo dice.
 */
type TranslationKey = keyof Messages & string;

const spanish: Messages = flatten(spanishSource);

/** Ingles. Debe declarar exactamente las mismas claves que `spanishSource`. */
const english: Record<TranslationKey, string> = flatten({
  app: {
    welcome: 'Welcome to Foreveryone',
    settings: 'Preferences',
    language: 'Language',
    theme: 'Theme',
    themeDark: 'Dark',
    themeLight: 'Light',
  },

  nav: {
    label: 'Main navigation',
    hero: 'Hero',
    castle: 'Castle',
    shop: 'Shop',
    logout: 'Log out',
  },

  auth: {
    login: 'Log in',
    register: 'Sign up',
    enter: 'Log in',
    registerAction: 'Sign up',
    waiting: 'One moment…',
    identifierPlaceholder: 'Email or username',
    usernamePlaceholder: 'Username',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    usernameHint: '3 to 24 characters. Letters, numbers, dot, hyphen and underscore.',
    usernamePatternTitle:
      '3 to 24 characters, starting and ending with a letter or number. Letters, numbers, dot, hyphen and underscore only.',
    registerSuccess: 'Account created! You can now log in as "{username}".',
    genericError: 'The operation could not be completed.',
  },

  gate: {
    searching: 'Looking up your destiny in Foreveryone…',
    invalidSession: 'Your session is invalid or has expired. Log in again to continue.',
    backToLogin: 'Back to log in',
    checkFailed:
      'Could not check whether you already have a character. Make sure the services are running.',
    retry: 'Retry',
  },

  creation: {
    title: 'Create your character',
    subtitle: 'Foreveryone needs a hero. Choose your race first, then your class.',
    stepsLabel: 'Creation progress',
    stepRace: 'Choose your race',
    stepClass: 'Choose your class',
    manaLabel: 'Mana',
    health: 'Health',
    attack: 'Attack',
    defense: 'Defense',
    mana: 'Mana',
    gold: 'Gold',
    attackShort: 'Atk',
    defenseShort: 'Def',
    summoning: 'Summoning your destiny…',
    welcome: 'Welcome, {name}',
    changeRace: 'Change race',
    continueToClass: 'Continue to class',
    creatingCharacter: 'Creating character…',
    enterGame: 'Enter Foreveryone',
    loadError: 'Could not load the races and classes.',
    createError: 'Could not create your character.',
    accountGone:
      'Your account no longer exists on the server. Log in again or register a new one.',
    closeSession: 'Log out',
  },

  hero: {
    cardLabel: 'Foreveryone hero',
    portraitAlt: 'Portrait of {name}, {class}',
    level: 'Lv. {level}',
    health: 'Health',
    healthLabel: 'Hero health',
    statsLabel: 'Hero stats',
    manaLabel: 'Mana',
    statusDefeated: 'Defeated',
    statusRested: 'Rested',
    statusReady: 'Ready for adventure',
    rest: 'Rest',
    resting: 'Resting…',
    visitShop: 'Visit the shop',
    loadingLabel: 'Loading hero information',
    adventurer: 'Adventurer',
    heroFallback: 'Hero',
    loadError: 'Could not load your hero.',
    refreshError: 'Could not refresh the hero information.',
    restError: 'Could not rest.',
    race: {
      humano: 'Human',
      elfo: 'Elf',
      enano: 'Dwarf',
      orco: 'Orc',
    },
    class: {
      warrior: 'Warrior',
      hunter: 'Hunter',
      wizard: 'Wizard',
      rogue: 'Rogue',
    },
    specialty: {
      warrior: 'Specialist in close combat.',
      hunter: 'Expert at ranged attacks.',
      wizard: 'Master of magic and arcane power.',
      rogue: 'Swift steel and precise strikes.',
      fallback: 'An adventurer in the kingdom’s service.',
    },
    raceDescription: {
      humano: 'Versatile with no marked weaknesses. Fits any class.',
      elfo: 'Forest-born: accurate and magical, but frail up close.',
      enano: 'Overwhelming strength and great vitality, with less defence and less mana.',
      orco: 'Overwhelming strength and great vitality, with less defence and less mana.',
    },
    classDescription: {
      warrior: 'Specialist in close combat. No marked weaknesses.',
      hunter: 'Expert at ranged attacks. Precision and speed.',
      wizard: 'Master of magic. Heavy arcane damage in exchange for fragility.',
      rogue: 'Deadly shadow. Balances damage and survivability with very little mana.',
    },
  },

  battle: {
    label: 'Turn-based battles',
    title: 'Battles',
    subtitle: 'Pick your rival. Each turn you decide how to attack.',
    logLabel: 'Battle turns',
    noEnemies: 'There are no rivals available in this kingdom.',
    heroDefeated: 'Your hero is defeated. Rest before fighting again.',
    yourHero: 'Your hero',
    heroHealthLabel: 'Your hero’s health',
    heroManaLabel: 'Your hero’s mana',
    turn: 'Turn {round}',
    victory: 'Victory!',
    defeat: 'Defeat',
    again: 'Pick another rival',
    damageText: '{damage} damage',
    noDamage: 'Deals no damage',
    manaCost: '{cost} mana',
    noMana: 'No mana',
    uses: 'Uses: {left}/{limit}',
    exp: '{value} exp',
    gold: '{value} gold',
    loadError: 'Could not load the enemies.',
    startError: 'Could not start the battle.',
    turnError: 'Could not play the turn.',
  },

  kingdom: {
    loading: 'Surveying the lands of your kingdom…',
    loadError: 'Could not load your kingdom.',
    notCreated: 'You do not have a kingdom yet.',
    create: 'Found kingdom',
    creating: 'Founding…',
    emptyTitle: 'No buildings yet',
    buildMenu: 'Expand your kingdom',
    build: 'Build',
    building: 'Built',
    upgrade: 'Upgrade',
    level: 'Level {level}',
    army: 'Army: {size}',
    armyLabel: 'Your troops',
    militaryPower: 'Military power: {power}',
    wood: 'Wood',
    stone: 'Stone',
    food: 'Food',
    training: 'Train troops',
    train: 'Train {amount} troops',
    soldiers: 'troops',
    trainingInProgress: 'Training…',
    needsBarracks: 'Build a {barracks} before you can train troops.',
    created: 'Your kingdom has been founded.',
    built: '{building} built.',
    upgraded: '{building} upgraded to level {level}.',
    actionError: 'The action could not be completed.',
    resources: 'Resources',
  },

  shop: {
    loading: 'Opening the merchant’s stall…',
    needsHero: 'You need a hero to enter the shop.',
    loadHeroError: 'Could not load your hero.',
    loadCatalogError: 'Could not load the shop catalogue.',
    title: 'Foreveryone shop',
    gold: 'Gold: {value}',
    empty: 'The merchant has nothing prepared for now.',
    buy: 'Buy',
    buying: 'Buying…',
    buyError: 'Could not buy the item.',
  },

  notFound: {
    title: 'This page does not exist',
    back: 'Back to my hero',
  },

  error: {
    brokenTitle: 'Something went wrong',
    brokenBody:
      'The current view could not be drawn. You can reload the page to keep playing.',
    detailLabel: 'Technical detail',
    retry: 'Retry',
    reload: 'Reload the page',
    closeSession: 'Log out',
  },

  network: {
    down: 'No connection to the server. Make sure the services are running.',
  },

  enemy: {
    goblin: 'Goblin',
    wolf: 'Wolf',
    ogre: 'Ogre',
  },

  building: {
    farm: { name: 'Farm', desc: 'Generates food passively to feed the kingdom.' },
    sawmill: { name: 'Sawmill', desc: 'Generates wood passively for building and upgrades.' },
    quarry: { name: 'Quarry', desc: 'Generates stone passively for building and upgrades.' },
    market: { name: 'Market', desc: 'Generates gold passively to fund the kingdom.' },
    barracks: { name: 'Barracks', desc: 'Allows training soldiers to defend the kingdom.' },
    castle: { name: 'Castle', desc: 'The fortress of the kingdom. It cannot be built by hand.' },
    fallback: 'Building',
    fallbackDesc: 'Building erected for the functioning of the kingdom.',
  },

  ability: {
    warrior: {
      attack: { name: 'Sword Slash', desc: 'Basic melee attack.' },
      powerStrike: {
        name: 'Lunge',
        desc: 'A precise thrust that doubles the damage. No mana cost.',
      },
      special: {
        name: 'Guard',
        desc: 'Leaves you open: halves the damage taken this turn.',
      },
    },
    hunter: {
      attack: { name: 'Shot', desc: 'Basic ranged shot.' },
      powerStrike: { name: 'Volley', desc: 'Two arrows at once: well over double the damage.' },
      special: {
        name: 'Piercing Shot',
        desc: 'Ignores the enemy’s defence and pierces through its armour.',
      },
    },
    wizard: {
      attack: { name: 'Arcane Dart', desc: 'Modest magical attack, always available.' },
      powerStrike: { name: 'Fireball', desc: 'Devastating explosion. Costs a lot of mana.' },
      special: {
        name: 'Arcane Shield',
        desc: 'Does not attack: recovers health before the enemy counterattacks.',
      },
    },
    rogue: {
      attack: { name: 'Slash', desc: 'Quick basic cut.' },
      powerStrike: { name: 'Sneak Attack', desc: 'Leaves the shadows and strikes without warning.' },
      special: { name: 'Cold Blood', desc: 'Steals life from the enemy and heals for part of it.' },
    },
  },

  shopItem: {
    sword: { name: '🗡️ Iron Sword', desc: 'Permanently increases Attack by +10.' },
    armor: { name: '🛡️ Leather Armour', desc: 'Permanently increases Defence by +10.' },
    potion: { name: '🧪 Health Potion', desc: 'Restores all of your health instantly.' },
  },

  'battle.round.struck':
    'Turn {round}: {ability} deals {heroDamage} damage. {enemy} answers with {enemyDamage}. Your health: {heroHealth}.',
  'battle.round.guarded':
    'Turn {round}: {ability} and {enemy}’s blow bounces off: {enemyDamage} damage. Your health: {heroHealth}.',
  'battle.round.healed':
    'Turn {round}: {ability} recovers health before the counterattack. {enemy} answers with {enemyDamage}. Your health: {heroHealth}.',
  'battle.round.drained':
    'Turn {round}: {ability} deals {heroDamage} damage and steals life. {enemy} answers with {enemyDamage}. Your health: {heroHealth}.',
  'battle.round.enemyDefeated':
    'Turn {round}: {ability} deals {heroDamage} damage. {enemy} has fallen!',

  'battle.outcome.victory':
    'Victory against {enemy}! You gained {experienceGained} experience and {goldGained} gold.',
  'battle.outcome.defeat': 'You were defeated by {enemy}. Your hero needs to rest.',

  'battle.turn.prompt': 'Turn {round}: choose how to attack.',

  'battle.blocked.notInKit': 'Your class does not have that ability.',
  'battle.blocked.noUsesLeft': 'You have no uses left of {ability}.',
  'battle.blocked.manaTooLow':
    'You need {cost} mana for {ability} and you only have {have}.',

  'battle.error.noneInProgress': 'You have no battle in progress.',
  'battle.error.notFound': 'The battle does not exist.',
  'battle.error.enemyNotFound': 'That enemy does not exist in this kingdom.',
  'battle.error.alreadyInProgress': 'You already have a battle in progress.',
  'battle.error.alreadyFinished': 'The battle has already finished.',
  'battle.error.heroDefeated': 'Your hero is defeated. They must rest before fighting!',

  'battle.validation.userRequired': 'The user identifier is required.',
  'battle.validation.invalidBattle': 'The battle is not valid.',
  'battle.validation.invalidAction': 'The action is not valid.',
  'battle.validation.enemyRequired': 'You must say which enemy you are fighting.',

  'hero.error.notFound': 'Hero not found.',
  'hero.error.defeated': 'Your hero is defeated. They must rest before adventuring!',
  'hero.error.alreadyHasHero': 'This user already has a hero.',
  'hero.error.userMissingInIdentity': 'The user does not exist in Identity.',

  'hero.validation.invalidRace': 'The race is not valid.',
  'hero.validation.invalidClass': 'The hero class is not valid.',

  'hero.message.rested': 'Your hero rested and recovered its health.',

  'kingdom.error.notFound': 'This user does not have a kingdom.',
  'kingdom.error.userMissingInIdentity': 'The user does not exist in Identity.',
  'kingdom.error.alreadyHasKingdom': 'This user already has a kingdom.',
  'kingdom.error.needsBarracks': 'You need to build a Barracks first.',
  'kingdom.error.notEnoughToTrain': 'Not enough gold or food to train troops.',
  'kingdom.error.armyAmountMustBePositive':
    'The number of troops to train must be greater than 0.',
  'kingdom.error.buildingNotBuilt': 'You do not have that building.',
  'kingdom.error.notEnoughToUpgrade': 'Not enough resources to upgrade the building.',
  'kingdom.error.buildingAlreadyExists':
    'This kingdom already has a building of that type.',
  'kingdom.error.notEnoughToBuild': 'Not enough resources to build.',
  'kingdom.error.notEnoughResources': 'Not enough resources.',

  'kingdom.message.troopsTrained': 'Troops trained successfully.',

  'shop.error.itemNotFound': 'That item does not exist in the shop.',
  'shop.error.notEnoughGold': 'Not enough gold to buy this item.',
  'shop.error.invalidRequest': 'The purchase could not be processed.',
  'shop.message.purchaseSuccess': 'Purchase successful!',

  'auth.error.emailEmpty': 'The email cannot be empty.',
  'auth.error.emailTooLong': 'The email is too long.',
  'auth.error.emailInvalid': 'The email format is not valid.',
  'auth.error.usernameEmpty': 'The username cannot be empty.',
  'auth.error.usernameTooShort': 'The username must be at least 3 characters.',
  'auth.error.usernameTooLong': 'The username cannot exceed 24 characters.',
  'auth.error.usernamePattern':
    'The username only allows letters, numbers, dot, hyphen and underscore, and must start and end with a letter or number.',
  'auth.error.emailAlreadyInUse': 'An account with this email already exists.',
  'auth.error.usernameAlreadyInUse': 'An account with this username already exists.',
  'auth.error.userNotFound': 'The user does not exist.',
  'auth.error.invalidCredentials': 'Wrong email, username or password.',
  'auth.error.accountInactive': 'This account is deactivated.',

  'auth.validation.usernameRequired': 'The username is required.',
  'auth.validation.usernameTooShort': 'The username must be at least 3 characters.',
  'auth.validation.usernameTooLong': 'The username cannot exceed 24 characters.',
  'auth.validation.usernamePattern':
    'The username only allows letters, numbers, dot, hyphen and underscore, and must start and end with a letter or number.',
  'auth.validation.emailRequired': 'The email is required.',
  'auth.validation.emailInvalid': 'The email format is not valid.',
  'auth.validation.passwordRequired': 'The password is required.',
  'auth.validation.passwordTooShort': 'The password must be at least 8 characters.',
  'auth.validation.passwordNeedsUppercase':
    'The password must contain at least one uppercase letter.',
  'auth.validation.passwordNeedsDigit': 'The password must contain at least one number.',
  'auth.validation.identifierRequired': 'The email or username is required.',
  'auth.validation.identifierTooLong': 'The email or username is too long.',
});

export const dictionaries = { es: spanish, en: english };

export type { TranslationKey };