import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import Succeed from "@/behavior/base/nodes/decorators/Succeed";
import If from "@/behavior/base/nodes/If";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import FollowPath from "@/behavior/mudman/nodes/FollowPath";

export default class MoveNear extends DecoratorNode {
  constructor() {
    super(new If<MudmanBlackboard, MudworldBlackboard>(
      local => local.isNearDestination,
      new Succeed(),
      new FollowPath(),
    ));
  }
}
