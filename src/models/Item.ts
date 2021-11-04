import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";

export const enum ItemType {
  WATER,
  FIRE,
}

export default class Item {
  public readonly id: symbol;

  public type: ItemType;
  public x: number;
  public y: number;
  public held: boolean;
  public used: boolean;
  public collectible: boolean;

  constructor(type: ItemType, x: number, y: number, collectible = true) {
    this.id = Symbol();
    this.type = type;
    this.x = x;
    this.y = y;
    this.held = false;
    this.used = false;
    this.collectible = collectible;
  }

  use(_local: MudmanBlackboard): void {
    this.used = true;
  }
}
