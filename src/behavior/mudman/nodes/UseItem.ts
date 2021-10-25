import BaseNode from "@/behavior/base/nodes/BaseNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import { ItemType } from "@/models/Item";

export default class UseItem extends BaseNode {
  public itemType: ItemType;

  constructor(itemType: ItemType) {
    super();
    this.itemType = itemType;
  }

  process(local: MudmanBlackboard, _world: MudworldBlackboard): void {
    const heldItem = local.unusedFromInventory(this.itemType);

    if (heldItem && !heldItem.used) {
      heldItem.use(local);
      this.succeed();
    } else {
      this.fail();
    }
  }
}
