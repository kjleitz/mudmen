import Any from "@/behavior/base/nodes/composites/Any";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import HasPersonalSpace from "@/behavior/mudman/nodes/leaves/HasPersonalSpace";
import IsMoving from "@/behavior/mudman/nodes/leaves/IsMoving";
import WanderCloseBy from "@/behavior/mudman/nodes/leaves/WanderCloseBy";

export default class MakeRoomForOthers extends DecoratorNode {
  constructor() {
    super(new Any([
      // only do the rest if the mudman is standing/sitting still
      new IsMoving(),
      // already has personal space
      new HasPersonalSpace(),
      // can move around to make room
      new WanderCloseBy(),
    ]));
  }
}
