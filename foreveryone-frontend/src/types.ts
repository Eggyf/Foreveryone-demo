export interface HeroData {
    heroId: string;
    class: string;
    level: number;
    health: number;
    currentHealth: number; // NUEVO
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