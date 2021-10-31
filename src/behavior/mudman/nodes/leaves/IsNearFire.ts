import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import IsNearItem from "@/behavior/mudman/nodes/leaves/IsNearItem";
import { ItemType } from "@/models/Item";

export default class IsNearFire extends DecoratorNode {
  constructor() {
    super(new IsNearItem(ItemType.FIRE));
  }
}
