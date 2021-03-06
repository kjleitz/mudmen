import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import processSetPathToNear from "@/behavior/mudman/nodes/processes/processSetPathToNear";
import { ItemType } from "@/models/Item";

export default class SetPathToNearItem extends LeafNode {
  constructor(public itemType: ItemType) {
    super();
  }

  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const item = world.data.items.findClosest(this.itemType, local.x, local.y, (item) => {
      return !local.isUnreachable(item.x, item.y);
    });

    if (!item) {
      this.fail();
    } else {
      processSetPathToNear(this, item.x, item.y, local, world);
    }
  }
}
