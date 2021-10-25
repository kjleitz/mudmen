import All from "@/behavior/base/nodes/composites/All";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import FollowPath from "@/behavior/mudman/nodes/FollowPath";
// import MoveToTarget from "@/behavior/mudman/nodes/MoveToTarget";

export default class Move extends DecoratorNode {
  constructor() {
    super(new All([
      // new MoveToTarget(),
      new FollowPath(),
    ]));
  }
}
