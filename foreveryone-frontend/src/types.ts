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

export interface BattleRound {
    round: number;
    heroDamage: number;
    enemyDamage: number;
    enemyHealthRemaining: number;
    heroHealthRemaining: number;
    message: string;
}

export interface BattleResult {
    victory: boolean;
    enemyKey: string;
    enemyName: string;
    enemyHealth: number;
    enemyAttack: number;
    enemyDefense: number;
    rounds: BattleRound[];
    experienceGained: number;
    goldGained: number;
    levelBefore: number;
    levelAfter: number;
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