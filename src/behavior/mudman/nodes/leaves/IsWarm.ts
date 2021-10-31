import Any from "@/behavior/base/nodes/composites/Any";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import IsDay from "@/behavior/mudman/nodes/leaves/IsDay";
import IsNearFire from "@/behavior/mudman/nodes/leaves/IsNearFire";

export default class IsWarm extends DecoratorNode {
  constructor() {
    super(new Any([
      new IsDay(),
      new IsNearFire(),
    ]));
  }
}
