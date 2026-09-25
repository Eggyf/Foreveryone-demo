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