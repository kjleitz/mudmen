import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";

export default class Sit extends LeafNode {
  process(local: MudmanBlackboard): void {
    local.clearPath();
    local.data.sitting = true;
    this.succeed();
  }
}
