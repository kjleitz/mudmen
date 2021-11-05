import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";

export default class TargetNearbyMudman extends LeafNode {
  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const mudman = world.findClosestFellowMudman(local);

    if (!mudman) {
      this.fail();
      return;
    }

    if (local.isNear(mudman.local.x, mudman.local.y)) {
      this.succeed();
      return;
    }

    local.data.movingTarget = mudman.local;
    this.succeed();
  }
}
