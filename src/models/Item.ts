import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";

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
  // public used: boolean;
  public collectible: boolean;

  private usedAt: DOMHighResTimeStamp | null = null;

  constructor(type: ItemType, x: number, y: number, collectible = true) {
    this.id = Symbol();
    this.type = type;
    this.x = x;
    this.y = y;
    this.held = false;
    // this.used = false;
    this.collectible = collectible;
  }

  // set used(value: boolean) { this.usedAt =  }
  get used(): boolean { return !!this.usedAt }

  use(local: MudmanBlackboard, world: MudworldBlackboard): void {
    this.usedAt = world.data.timestamp;
  }

  refurbish(): void {
    this.usedAt = null;
  }
}
