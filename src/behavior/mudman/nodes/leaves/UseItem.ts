import BaseNode from "@/behavior/base/nodes/BaseNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import { ItemType } from "@/models/Item";

export default class UseItem extends BaseNode {
  constructor(public itemType: ItemType) {
    super();
  }

  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const heldItem = local.unusedFromInventory(this.itemType);

    if (heldItem && !heldItem.used) {
      heldItem.use(local, world);
      this.succeed();
    } else {
      this.fail();
    }
  }
}
