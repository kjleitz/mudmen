import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import { mudworld } from "@/behavior/mudman/data/MudworldBlackboard";
// import { uuid } from "@/utilities/generators";

export const enum ItemType {
  WATER,
}

export default class Item {
  // public readonly id: string;
  public readonly id: symbol;

  public type: ItemType;
  public x: number;
  public y: number;
  public held: boolean;
  public used: boolean;

  constructor(type: ItemType, x: number, y: number) {
    // this.id = uuid();
    this.id = Symbol();
    this.type = type;
    this.x = x;
    this.y = y;
    this.held = false;
    this.used = false;
  }

  use(_local: MudmanBlackboard): void {
    this.used = true;
  };
}
