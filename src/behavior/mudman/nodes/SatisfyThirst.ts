import All from "@/behavior/base/nodes/composites/All";
import Any from "@/behavior/base/nodes/composites/Any";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import UntilSuccess from "@/behavior/base/nodes/decorators/UntilSuccess";
import AnonMudmanNode from "@/behavior/mudman/nodes/AnonMudmanNode";
import FindItem from "@/behavior/mudman/nodes/FindItem";
import MoveToTarget from "@/behavior/mudman/nodes/MoveToTarget";
import UseItem from "@/behavior/mudman/nodes/UseItem";
import { ItemType } from "@/models/Item";

export default class SatisfyThirst extends DecoratorNode {
  constructor() {
    super(new Any([
      new AnonMudmanNode(local => local.data.hydration > 0),
      new UseItem(ItemType.WATER),
      new UntilSuccess(new All([
        new FindItem(ItemType.WATER),
      ])),
    ]));
  }
}
