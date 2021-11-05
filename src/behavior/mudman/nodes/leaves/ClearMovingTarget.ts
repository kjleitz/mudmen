import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";

export default class ClearMovingTarget extends LeafNode {
  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    local.data.movingTarget = null;
    this.succeed();
  }
}
