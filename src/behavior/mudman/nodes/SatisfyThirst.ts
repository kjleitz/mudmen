import Any from "@/behavior/base/nodes/composites/Any";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import AnonMudmanNode from "@/behavior/mudman/nodes/AnonMudmanNode";
import UseOrFindAndUseItem from "@/behavior/mudman/nodes/UseOrFindAndUseItem";
import { ItemType } from "@/models/Item";

export default class SatisfyThirst extends DecoratorNode {
  constructor() {
    super(new Any([
      new AnonMudmanNode(local => local.data.hydration > 0),
      new UseOrFindAndUseItem(ItemType.WATER),
    ]));
  }
}
