import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import { ItemType } from "@/models/Item";

export default class HasPersonalSpace extends LeafNode {
  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const closestMudman = world.findClosestFellowMudman(local);
    const closestFire = world.data.items.findClosest(ItemType.FIRE, local.x, local.y);

    if (!closestMudman && !closestFire) {
      // nobody close by
      this.succeed();
      return;
    }

    if (
      (closestMudman && local.isCrowding(closestMudman.local.x, closestMudman.local.y))
      || (closestFire && local.isCrowding(closestFire.x, closestFire.y))
    ) {
      // too close
      this.fail();
      return;
    }

    this.succeed();
  }
}
