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

    // console.log("finding item...")

    if (!item) {
      // console.log("literally none left in the entire world")
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
      // console.log("hey I can get there")
      this.succeed();
    } else {
      // console.log("oh yeah no that's too far")
      this.fail();
    }
  }
}
