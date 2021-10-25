import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";

export default class FollowPath extends LeafNode {
  process(local: MudmanBlackboard, _world: MudworldBlackboard): void {
    if (!local.hasPath) {
      this.succeed();
      return;
    }

    local.followPath();
    if (!local.hasPath) this.succeed();
  }
}
