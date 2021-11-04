import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";

export default class PickUpTargetedItem extends LeafNode {
  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const item = local.data.targetedItem;

    if (item && local.isAt(item.x, item.y) && !item.held) {
      local.pickUp(item);
      this.succeed();
    } else {
      this.fail();
    }
  }
}
