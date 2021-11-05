import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";

export default class FeelSocial extends LeafNode {
  constructor(public amount: number) {
    super();
  }

  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    local.feelSocial(this.amount);
    this.succeed();
  }
}
