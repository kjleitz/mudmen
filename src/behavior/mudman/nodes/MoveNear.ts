import Any from "@/behavior/base/nodes/composites/Any";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import Succeed from "@/behavior/base/nodes/decorators/Succeed";
import If from "@/behavior/base/nodes/If";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import AnonMudmanNode from "@/behavior/mudman/nodes/AnonMudmanNode";
import FollowPath from "@/behavior/mudman/nodes/FollowPath";
import FollowPathUntilNear from "@/behavior/mudman/nodes/FollowPathUntilNear";
import Stop from "@/behavior/mudman/nodes/Stop";

export default class MoveNear extends DecoratorNode {
  constructor() {
    // super(new If<MudmanBlackboard, MudworldBlackboard>(
    //   local => local.isNearDestination,
    //   new Succeed(),
    //   new FollowPath(),
    // ));
    // super(new Any([
    //   new AnonMudmanNode(local => local.isNearDestination),
    //   new FollowPathUntilNear(),
    // ]));
    super(new FollowPathUntilNear());
  }
}
