import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import { ItemType } from "@/models/Item";

export default class IsNearItem extends LeafNode {
  constructor(public itemType: ItemType) {
    super();
  }

  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const closestItem = world.data.items.findClosest(this.itemType, local.x, local.y);
    if (closestItem && local.isNear(closestItem.x, closestItem.y)) {
      this.succeed();
    } else {
      this.fail();
    }
  }
}
