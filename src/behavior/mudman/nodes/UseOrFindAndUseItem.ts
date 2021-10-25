import All from "@/behavior/base/nodes/composites/All";
import Any from "@/behavior/base/nodes/composites/Any";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import UntilSuccess from "@/behavior/base/nodes/decorators/UntilSuccess";
import FindItem from "@/behavior/mudman/nodes/FindItem";
import Move from "@/behavior/mudman/nodes/Move";
import PickUpItem from "@/behavior/mudman/nodes/PickUpItem";
import UseItem from "@/behavior/mudman/nodes/UseItem";
import { ItemType } from "@/models/Item";

export default class UseOrFindAndUseItem extends DecoratorNode {
  constructor(itemType: ItemType) {
    super(new Any([
      new UseItem(itemType),
      new UntilSuccess(new All([
        new FindItem(itemType),
        new Move(),
        new PickUpItem(itemType),
        new UseItem(itemType),
      ])),
    ]));
  }
}
