import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import Item, { ItemType } from "@/models/Item";

export default class Fire extends Item {
  constructor(x: number, y: number) {
    super(ItemType.FIRE, x, y, false);
  }

  use(local: MudmanBlackboard, world: MudworldBlackboard): void {
    super.use(local, world); // in case there's other shit that should happen, but...
    this.refurbish(); // ...we don't want to mark a fire as "used."

    local.data.sitting = true;
    local.face(this.x, this.y);
  }
}
