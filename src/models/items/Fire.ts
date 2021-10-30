import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import Item, { ItemType } from "@/models/Item";

export default class Fire extends Item {
  constructor(x: number, y: number) {
    super(ItemType.FIRE, x, y);
  }

  use(local: MudmanBlackboard): void {
    // super.use(local);
    // TODO
    local.data.sitting = true;
  }
}
