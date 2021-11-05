import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import processSetPathTo from "@/behavior/mudman/nodes/processes/processSetPathTo";
import processSetPathToNear from "@/behavior/mudman/nodes/processes/processSetPathToNear";
import { randomPointInCircle } from "@/utilities/geo";

export default class WanderCloseBy extends LeafNode {
  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const spot = randomPointInCircle(local.x, local.y, local.crowdingThreshold, 2 * local.crowdingThreshold);

    let tries = 0;
    while (!local.hasPath) {
      if (tries > 25) {
        this.fail();
        return;
      }

      processSetPathTo(this, spot[0], spot[1], local, world);
      tries += 1;
    }

    this.succeed();
  }
}
