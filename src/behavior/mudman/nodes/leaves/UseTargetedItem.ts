import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";

export default class UseTargetedItem extends LeafNode {
  process(local: MudmanBlackboard, _world: MudworldBlackboard): void {
    const item = local.data.targetedItem;

    if (!item) {
      this.fail();
      return;
    }

    if (local.isHoldingItem(item) || (!item.collectible && local.isNear(item.x, item.y))) {
      if (!item.used) item.use(local);
      local.data.targetedItem = null;
      this.succeed();
    } else {
      this.fail();
    }
  }
}
