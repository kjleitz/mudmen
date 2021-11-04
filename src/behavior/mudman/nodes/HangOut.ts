import All from "@/behavior/base/nodes/composites/All";
import Any from "@/behavior/base/nodes/composites/Any";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import IsHydrated from "@/behavior/mudman/nodes/leaves/IsHydrated";
import IsTalking from "@/behavior/mudman/nodes/leaves/IsTalking";
import PickUpItem from "@/behavior/mudman/nodes/leaves/PickUpItem";
import TalkToNearbyMudman from "@/behavior/mudman/nodes/leaves/TalkToNearbyMudman";
import UseItem from "@/behavior/mudman/nodes/leaves/UseItem";
import { ItemType } from "@/models/Item";

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
      // // currently at water to pick up and use
      // new All([
      //   new PickUpItem(ItemType.WATER),
      //   new UseItem(ItemType.WATER),
      // ]),
    ]));
  }
}
