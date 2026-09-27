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

export interface EnemyOption {
    key: string;
    name: string;
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
    name: string;
    description: string;
    /** Dano exacto contra este enemigo; 0 en habilidades que no golpean. */
    damage: number;
    manaCost: number;
    available: boolean;
    /** Usos restantes, o -1 si la accion no tiene limite. */
    usesLeft: number;
    /** Usos por combate, o 0 si no tiene limite. */
    usesLimit: number;
    /** Por que no se puede jugar ahora, o cadena vacia si si se puede. */
    unavailableReason: string;
}

export interface BattleRound {
    round: number;
    action: BattleActionId;
    heroDamage: number;
    enemyDamage: number;
    enemyHealthRemaining: number;
    heroHealthRemaining: number;
    heroManaRemaining: number;
    message: string;
}

export interface BattleState {
    battleId: string;
    enemyKey: string;
    enemyName: string;
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
    message: string;
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

export interface ShopItemData {
    id: number;
    name: string;
    description: string;
    cost: number;
}