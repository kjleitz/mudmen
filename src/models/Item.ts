import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";

// TODO: ItemType is no longer useful as it is currently being used. The places
//       where it is used should be refactored to use the class constant instead
//       and Item should be made into an abstract class.
export const enum ItemType {
  BOTTLE,
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

  use(local: MudmanBlackboard, world: MudworldBlackboard): void {
    this.used = true;
  }

  drop(local: MudmanBlackboard, world: MudworldBlackboard): void {
    this.held = false;
    this.x = local.x;
    this.y = local.y;
  }

  moveTo(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  refurbish(): void {
    // this.usedAt = null;
    this.used = false;
  }
}
