import Any from "@/behavior/base/nodes/composites/Any";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import IsTalking from "@/behavior/mudman/nodes/leaves/IsTalking";
import TalkToNearbyMudman from "@/behavior/mudman/nodes/leaves/TalkToNearbyMudman";
import TargetNearbyMudman from "@/behavior/mudman/nodes/leaves/TargetNearbyMudman";

// Succeeds if:
//
//   - mudman is already hydrated
//   - mudman has water on hand and uses it successfully
//   - mudman is currently on top of a water item and picks it up and uses it
//     successfully
//
// Otherwise, it fails.
//
export default class HangOut extends DecoratorNode {
  constructor() {
    super(new Any([
      // already talking
      new IsTalking(),
      // is next to someone to talk to and does so successfully
      new TalkToNearbyMudman(),
      // finds someone to talk to and sets his sights on the guy
      new TargetNearbyMudman(),
    ]));
  }
}
