import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import processSetPathTo from "@/behavior/mudman/nodes/processes/processSetPathTo";
import { ItemType } from "@/models/Item";

export default class SetPathToItem extends LeafNode {
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
      processSetPathTo(this, item.x, item.y, local, world);
    }
  }
}
