import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import { mudworld } from "@/behavior/mudman/data/MudworldBlackboard";
import { uuid } from "@/utilities/generators";

export const enum ItemType {
  WATER,
}

export default class Item {
  public readonly id: string;

  public type: ItemType;
  public x: number;
  public y: number;

  private _used: boolean = false;

  constructor(type: ItemType, x: number, y: number) {
    this.id = uuid();
    this.type = type;
    this.x = x;
    this.y = y;
    mudworld.data.itemsByType[type].push(this);
  }

  set used(used: boolean) {
    if (used) 
    this._used = used;
  }

  get used(): boolean {
    return this._used;
  }

  use(_local: MudmanBlackboard): void {
    this.used = true;
  };
}
