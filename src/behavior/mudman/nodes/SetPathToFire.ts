import Any from "@/behavior/base/nodes/composites/Any";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import FindItem from "@/behavior/mudman/nodes/FindItem";
import IsNearFire from "@/behavior/mudman/nodes/leaves/IsNearFire";
import SetPathToNearItem from "@/behavior/mudman/nodes/leaves/SetPathToNearItem";
import { ItemType } from "@/models/Item";

export default class SetPathToFire extends DecoratorNode {
  constructor() {
    super(new Any([
      new IsNearFire(),
      new SetPathToNearItem(ItemType.FIRE),
    ]));
  }
}
