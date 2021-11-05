import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";

export default class IsTalkingToFarOffMudman extends LeafNode {
  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const { talkingTo } = local.data;
    if (talkingTo && !local.isNear(talkingTo.local.x, talkingTo.local.y)) {
      this.succeed();
    } else {
      this.fail();
    }
  }
}
