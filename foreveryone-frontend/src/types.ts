import type { LocalizedText } from './i18n/I18nProvider';

export interface UserSession {
    userId: string;
    username: string;
    email: string;
    displayName: string;
}

export interface CharacterClassOption {
    id: number;
    name: string;
    health: number;
    attack: number;
    defense: number;
    mana: number;
}

export interface CharacterRaceOption {
    id: number;
    name: string;
    healthPercent: number;
    attackPercent: number;
    defensePercent: number;
    manaPercent: number;
}

export interface CharacterOptions {
    races: CharacterRaceOption[];
    classes: CharacterClassOption[];
}

export interface HeroData {
    heroId: string;
    race: string;
    class: string;
    level: number;
    /** Vida maxima. La vida actual es `currentHealth`. */
    health: number;
    currentHealth: number;
    gold: number;
    attack: number;
    defense: number;
    mana: number;
}

/**
 * Enemigo disponible. `nameKey` es la clave de traduccion del nombre: el servidor
 * no sabe en que idioma juega la persona, asi que no manda el texto.
 */
export interface EnemyOption {
    key: string;
    nameKey: string;
    health: number;
    attack: number;
    defense: number;
    experienceReward: number;
    goldReward: number;
}

/**
 * Ranura de accion del servidor. No es una habilidad concreta: cada clase
 * rellena las tres ranuras con su propio kit, y el nombre, el coste y el efecto
 * los decide la API en `actions`. Ver `BattleActionOption`.
 */
export type BattleActionId = 1 | 2 | 3;

export interface BattleActionOption {
    action: BattleActionId;
    /** Clave de traduccion del nombre de la habilidad. */
    nameKey: string;
    /** Clave de traduccion de la explicacion de una linea. */
    descriptionKey: string;
    /** Dano exacto contra este enemigo; 0 en habilidades que no golpean. */
    damage: number;
    manaCost: number;
    available: boolean;
    /** Usos restantes, o -1 si la accion no tiene limite. */
    usesLeft: number;
    /** Usos por combate, o 0 si no tiene limite. */
    usesLimit: number;
    /**
     * Por que no se puede jugar ahora, o `null` si si se puede. Llega con la
     * clave y sus argumentos: el cliente lo compone en su idioma.
     */
    unavailableReason: LocalizedText | null;
}

export interface BattleRound {
    round: number;
    action: BattleActionId;
    heroDamage: number;
    enemyDamage: number;
    enemyHealthRemaining: number;
    heroHealthRemaining: number;
    heroManaRemaining: number;
    /** Clave y argumentos del texto del turno; lo compone el cliente. */
    message: LocalizedText;
}

export interface BattleState {
    battleId: string;
    enemyKey: string;
    /** Clave de traduccion del nombre del enemigo. */
    enemyNameKey: string;
    round: number;
    enemyHealth: number;
    enemyMaxHealth: number;
    enemyAttack: number;
    enemyDefense: number;
    heroHealth: number;
    heroMaxHealth: number;
    heroMana: number;
    heroMaxMana: number;
    heroAttack: number;
    heroDefense: number;
    finished: boolean;
    victory: boolean;
    experienceGained: number;
    goldGained: number;
    actions: BattleActionOption[];
    rounds: BattleRound[];
    /** Clave y argumentos del mensaje de estado; lo compone el cliente. */
    message: LocalizedText;
}

export interface KingdomData {
    kingdomId: string;
    castleLevel: number;
    wood: number;
    stone: number;
    gold: number;
    food: number;
    buildings: BuildingData[];
    armySize: number;
    militaryPower: number;
}

export interface BuildingData {
    /** `BuildingType` del dominio de Kingdom: 1 castillo, 2 granja, 3 aserradero,
        4 cantera, 5 mercado, 6 cuartel. */
    type: number;
    /** Nombre del enum en ingles tal como lo devuelve el API. */
    name: string;
    level: number;
}

export interface UpgradeBuildingResult {
    buildingName: string;
    newLevel: number;
}

export interface TrainArmyResult {
    armySize: number;
    militaryPower: number;
    /** Clave y argumentos del mensaje; lo compone el cliente. */
    message: LocalizedText;
}

export interface RestHeroResult {
    currentHealth: number;
    /** Clave y argumentos del mensaje; lo compone el cliente. */
    message: LocalizedText;
}

export interface BuyItemResult {
    /** Clave y argumentos del mensaje; lo compone el cliente. */
    message: LocalizedText;
    currentGold: number;
}

/**
 * Articulo del catalogo. El nombre y la descripcion llegan como claves: el texto
 * lo decide el cliente, porque el servidor no sabe el idioma del jugador.
 */
export interface ShopItemData {
    id: number;
    /** Clave estable del articulo, por ejemplo `sword`. */
    key: string;
    nameKey: string;
    descriptionKey: string;
    cost: number;
}