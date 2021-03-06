import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";

export default class IsTalking extends LeafNode {
  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    if (local.data.talkingTo) {
      this.succeed();
    } else {
      this.fail();
    }
  }
}
