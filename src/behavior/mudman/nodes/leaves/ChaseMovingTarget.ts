import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import processSetPathToNear from "@/behavior/mudman/nodes/processes/processSetPathToNear";
import { distanceBetween } from "@/utilities/geo";

export default class ChaseMovingTarget extends LeafNode {
  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const { movingTarget } = local.data;

    if (!movingTarget) {
      this.succeed();
      return;
    }

    if (!local.isWithinEyesight(movingTarget.x, movingTarget.y)) {
      // lost 'em... oh well.
      local.data.movingTarget = null;
      this.succeed();
      return;
    }

    if (local.isNear(movingTarget.x, movingTarget.y)) {
      // hey, we caught up!
      local.data.movingTarget = null;
      this.succeed();
      return;
    }

    const { destination } = local;
    const onTarget = destination && distanceBetween(destination.x, destination.y, movingTarget.x, movingTarget.y) < local.nearbyThreshold;
    if (onTarget) {
      // already headed that way
      this.succeed();
      return;
    }

    // either we're not headed that way yet, or they've moved and our
    // destination is outdated... either way, let's forget wherever we were
    // going and find a new path to the target
    local.clearPath();
    processSetPathToNear(
      this,
      movingTarget.x,
      movingTarget.y,
      local,
      world,
    );

    // if (destination) {
    //   if (distanceBetween(destination.x, destination.y, movingTarget.x, movingTarget.y) < local.nearbyThreshold) {
    //     // we're already headed that way
    //     this.succeed();
    //   } else {
    //     local.clearPath();
    //     processSetPathToNear(
    //       this,
    //       movingTarget.x,
    //       movingTarget.y,
    //       local,
    //       world,
    //     );
    //   }
    // } else {
    //   processSetPathToNear(
    //     this,
    //     movingTarget.x,
    //     movingTarget.y,
    //     local,
    //     world,
    //   );
    // }
  }
}
