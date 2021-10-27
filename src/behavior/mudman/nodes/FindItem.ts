import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import { ItemType } from "@/models/Item";
import { coords } from "@/utilities/geo";

export default class FindItem extends LeafNode {
  public itemType: ItemType;

  constructor(itemType: ItemType) {
    super();
    this.itemType = itemType;
  }

  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const item = world.data.items.findClosest(this.itemType, local.x, local.y, (item) => {
      const unreachable = local.data.unreachable.find((coords) => coords[0] === item.x && coords[1] === item.y);
      return !unreachable;
    });

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
      // TODO: Is this the best time to clear the unreachable list? I *think* so
      //       but idk... maybe it should just be on a timer. Clearing
      //       unreachables on success makes sense though; it makes the
      //       unreachables really more of a vehicle for finding one that is
      //       navigable, rather than an exhaustive and semi-permanent list of
      //       unreachable points.
      // if (local.data.unreachable.length) console.log("found; clearing unreachables list", local.data.unreachable.length)
      local.data.unreachable.length = 0;
      this.succeed();
    } else {
      local.data.unreachable.push(coords(item.x, item.y));
      // console.log("unreachable; pushing", item.x, item.y)
      this.fail();
    }
  }
}
