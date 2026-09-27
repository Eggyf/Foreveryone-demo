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
    health: number;
    currentHealth: number;
    gold: number; // NUEVO
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

export type BattleActionId = 1 | 2;

export interface BattleActionOption {
    action: BattleActionId;
    name: string;
    description: string;
    damage: number;
    available: boolean;
    usesLeft: number;
}

export interface BattleRound {
    round: number;
    action: BattleActionId;
    heroDamage: number;
    enemyDamage: number;
    enemyHealthRemaining: number;
    heroHealthRemaining: number;
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
    armySize: number;      // NUEVO
    militaryPower: number; // NUEVO
}

export interface BuildingData {
    type: number;
    name: string;
    level: number;
}

export interface ShopItemData {
    id: number;
    name: string;
    description: string;
    cost: number;
}