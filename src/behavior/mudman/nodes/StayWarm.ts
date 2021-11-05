import All from "@/behavior/base/nodes/composites/All";
import Any from "@/behavior/base/nodes/composites/Any";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import FaceFire from "@/behavior/mudman/nodes/leaves/FaceFire";
import FaceItem from "@/behavior/mudman/nodes/leaves/FaceItem";
import IsDay from "@/behavior/mudman/nodes/leaves/IsDay";
import IsNearFire from "@/behavior/mudman/nodes/leaves/IsNearFire";
import IsWarm from "@/behavior/mudman/nodes/leaves/IsWarm";
import Sit from "@/behavior/mudman/nodes/leaves/Sit";
import { ItemType } from "@/models/Item";

// Succeeds if:
//
//   - it's daytime
//   - mudman is near a fire and sits next to it successfully
//
// Otherwise, it fails.
//
export default class StayWarm extends DecoratorNode {
  constructor() {
    super(new Any([
      // warm enough
      new IsWarm(),
      // it's daytime
      new IsDay(),
      // sitting near fire
      new All([
        new IsNearFire(),
        new FaceFire(),
        new Sit(),
      ]),
    ]));
  }
}
