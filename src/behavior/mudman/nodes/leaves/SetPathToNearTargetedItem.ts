import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import processSetPathToNear from "@/behavior/mudman/nodes/processes/processSetPathToNear";

export default class SetPathToNearTargetedItem extends LeafNode {
  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const item = local.data.targetedItem;

    if (!item) {
      this.fail();
    } else {
      processSetPathToNear(this, item.x, item.y, local, world);
    }
  }
}
