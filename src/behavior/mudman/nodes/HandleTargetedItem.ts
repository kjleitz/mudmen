import All from "@/behavior/base/nodes/composites/All";
import Any from "@/behavior/base/nodes/composites/Any";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import Invert from "@/behavior/base/nodes/decorators/Invert";
import HasTargetedItem from "@/behavior/mudman/nodes/leaves/HasTargetedItem";
import PickUpTargetedItem from "@/behavior/mudman/nodes/leaves/PickUpTargetedItem";
import UseTargetedItem from "@/behavior/mudman/nodes/leaves/UseTargetedItem";

// Succeeds if:
//
//   - mudman has no targeted item
//   - mudman is already holding the targeted item and uses it successfully
//   - mudman is currently on top of the targeted item and picks it up and uses
//     it successfully
//
// Otherwise, it fails.
//
export default class HandleTargetedItem extends DecoratorNode {
  constructor() {
    super(new Any([
      // has no targeted item
      new Invert(new HasTargetedItem()),
      // has targeted item on hand and can use it
      new UseTargetedItem(),
      // currently at targeted item to pick up and use
      new All([
        new PickUpTargetedItem(),
        new UseTargetedItem(),
      ]),
    ]));
  }
}
