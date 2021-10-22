import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";

export default class MoveToTarget extends LeafNode {
  process(local: MudmanBlackboard, _world: MudworldBlackboard): void {
    if (local.isAtTarget) {
      this.succeed();
      return;
    }

    local.moveTowardTarget();
    if (local.isAtTarget) this.succeed();
  }
}
