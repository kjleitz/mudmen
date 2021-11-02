import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import { ItemType } from "@/models/Item";

export default class PickUpItem extends LeafNode {
  constructor(public itemType: ItemType) {
    super();
  }

  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const item = world.data.items.findOfType(this.itemType, (item) => {
      return !item.used && !item.held && item.x === local.x && item.y === local.y;
    });

    if (item) {
      local.pickUp(item);
      this.succeed();
    } else {
      this.fail();
    }
  }
}
