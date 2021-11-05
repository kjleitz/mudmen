import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";

export default class GetUp extends LeafNode {
  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    local.data.sitting = false,
    this.succeed();
  }
}
