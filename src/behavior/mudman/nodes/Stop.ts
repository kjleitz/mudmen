import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";

export default class Stop extends LeafNode {
  process(local: MudmanBlackboard): void {
    local.clearPath();
    this.succeed();
  }
}
