export interface HeroData {
    heroId: string;
    class: string;
    level: number;
    health: number;
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
    buildings: string[];
}