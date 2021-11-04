import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import processSetPathTo from "@/behavior/mudman/nodes/processes/processSetPathTo";

export default class SetPathToTargetedItem extends LeafNode {
  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const item = local.data.targetedItem;

    if (!item) {
      this.fail();
    } else {
      processSetPathTo(this, item.x, item.y, local, world);
    }
  }
}
