import Any from "@/behavior/base/nodes/composites/Any";
import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import IsDay from "@/behavior/mudman/nodes/leaves/IsDay";
import IsNearFire from "@/behavior/mudman/nodes/leaves/IsNearFire";

export default class IsWarm extends LeafNode {
  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    if (local.percentWarm > 0.5) {
      this.succeed();
    } else {
      this.fail();
    }
  }

  // constructor() {
  //   super(new Any([
  //     new IsDay(),
  //     new IsNearFire(),
  //   ]));
  // }
}
