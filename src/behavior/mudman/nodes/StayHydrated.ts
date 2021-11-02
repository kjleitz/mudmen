import All from "@/behavior/base/nodes/composites/All";
import Any from "@/behavior/base/nodes/composites/Any";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import IsHydrated from "@/behavior/mudman/nodes/leaves/IsHydrated";
import PickUpItem from "@/behavior/mudman/nodes/leaves/PickUpItem";
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
export default class StayHydrated extends DecoratorNode {
  constructor() {
    super(new Any([
      // already hydrated
      new IsHydrated(),
      // has water on hand and can use it
      new UseItem(ItemType.WATER),
      // currently at water to pick up and use
      new All([
        new PickUpItem(ItemType.WATER),
        new UseItem(ItemType.WATER),
      ]),
    ]));
  }
}
