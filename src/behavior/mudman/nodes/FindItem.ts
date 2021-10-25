import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import { ItemType } from "@/models/Item";

export default class FindItem extends LeafNode {
  public itemType: ItemType;

  constructor(itemType: ItemType) {
    super();
    this.itemType = itemType;
  }

  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const item = world.data.items.findClosest(this.itemType, local.x, local.y);

    if (!item) {
      this.fail();
      return;
    }

    world.data.map.populatePath(
      local.data.path,
      local.x,
      local.y,
      item.x,
      item.y,
      local.data.eyesight,
    );

    if (local.hasPath) {
      this.succeed();
    } else {
      this.fail();
    }
  }
}
