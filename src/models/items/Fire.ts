import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import Item, { ItemType } from "@/models/Item";

export default class Fire extends Item {
  constructor(x: number, y: number) {
    super(ItemType.FIRE, x, y, false);
  }

  use(local: MudmanBlackboard): void {
    super.use(local); // in case there's other shit that should happen, but...
    this.used = false; // ...we don't want to mark a fire as "used."

    local.data.sitting = true;
  }
}
