import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";

export default class TalkToNearbyMudman extends LeafNode {
  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const mudman = world.findClosestFellowMudman(local);

    if (!mudman || !local.isNear(mudman.local.x, mudman.local.y)) {
      this.fail();
      return;
    }

    local.talkTo(mudman);
    this.succeed();
  }
}
