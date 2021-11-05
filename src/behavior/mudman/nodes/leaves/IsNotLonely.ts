import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import Invert from "@/behavior/base/nodes/decorators/Invert";
import IsLonely from "@/behavior/mudman/nodes/leaves/IsLonely";

export default class IsNotLonely extends DecoratorNode {
  constructor() {
    super(new Invert(new IsLonely()));
  }
}

// export default class IsNotLonely extends LeafNode {
//   process(local: MudmanBlackboard, world: MudworldBlackboard): void {
//     if (local.percentSocial >= 0.5) {
//       this.succeed();
//     } else {
//       this.fail();
//     }
//   }
// }
