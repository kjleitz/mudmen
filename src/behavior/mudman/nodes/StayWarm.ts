import All from "@/behavior/base/nodes/composites/All";
import Any from "@/behavior/base/nodes/composites/Any";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import IsDay from "@/behavior/mudman/nodes/leaves/IsDay";
import IsNearFire from "@/behavior/mudman/nodes/leaves/IsNearFire";
import Sit from "@/behavior/mudman/nodes/leaves/Sit";

// Succeeds if:
//
//   - it's daytime
//   - mudman is near a fire and sits next to it successfully
//
// Otherwise, it fails.
//
export default class StayHydrated extends DecoratorNode {
  constructor() {
    super(new Any([
      // it's daytime
      new IsDay(),
      // sitting near fire
      new All([
        new IsNearFire(),
        new Sit(),
      ]),
    ]));
  }
}
