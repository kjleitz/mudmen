import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import processSetPathToNear from "@/behavior/mudman/nodes/processes/processSetPathToNear";

export default class SetPathToNearClosestMudman extends LeafNode {
  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const mudman = world.findClosestMudman(local.x, local.y);

    if (!mudman) {
      this.fail();
    } else {
      const { destination } = mudman.local;
      if (destination) {
        processSetPathToNear(this, destination.x, destination.y, local, world);
      } else {
        processSetPathToNear(this, mudman.local.x, mudman.local.y, local, world);
      }
    }
  }
}
