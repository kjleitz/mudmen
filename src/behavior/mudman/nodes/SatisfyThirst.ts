import Any from "@/behavior/base/nodes/composites/Any";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import Succeed from "@/behavior/base/nodes/decorators/Succeed";
import If from "@/behavior/base/nodes/If";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import AnonMudmanNode from "@/behavior/mudman/nodes/AnonMudmanNode";
import UseOrFindAndUseItem from "@/behavior/mudman/nodes/UseOrFindAndUseItem";
import { ItemType } from "@/models/Item";

export default class SatisfyThirst extends DecoratorNode {
  constructor() {
    // super(new If<MudmanBlackboard, MudworldBlackboard>(
    //   local => local.data.hydration === 0,
    //   new UseOrFindAndUseItem(ItemType.WATER),
    //   new Succeed(),
    // ));
    super(new Any([
      new AnonMudmanNode(local => local.data.hydration > 0),
      new UseOrFindAndUseItem(ItemType.WATER),
    ]));
  }
}
