import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import Item, { ItemType } from "@/models/Item";

export default class Water extends Item {
  public volume: number;

  constructor(volume: number, x: number, y: number) {
    super(ItemType.WATER, x, y);
    this.volume = volume;
  }

  use(local: MudmanBlackboard): void {
    local.hydrate(this.volume);
    this.used = true;
  }
}
