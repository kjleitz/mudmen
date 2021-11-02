import All from "@/behavior/base/nodes/composites/All";
import Any from "@/behavior/base/nodes/composites/Any";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import Fail from "@/behavior/base/nodes/decorators/Fail";
import Repeat from "@/behavior/base/nodes/decorators/Repeat";
import FollowPath from "@/behavior/mudman/nodes/leaves/FollowPath";
import SetPathToItem from "@/behavior/mudman/nodes/leaves/SetPathToItem";
import SetPathToNearItem from "@/behavior/mudman/nodes/leaves/SetPathToNearItem";
import { ItemType } from "@/models/Item";
import StayHydrated from "@/behavior/mudman/nodes/StayHydrated";
import StayWarm from "@/behavior/mudman/nodes/StayWarm";

export default class MudmanBehavior extends DecoratorNode {
  constructor() {
    super(new Repeat(new All([
      new FollowPath(),
      new Any([
        new StayHydrated(),
        // set a path to some water (fail here so it returns to the beginning)
        new Fail(new SetPathToItem(ItemType.WATER)),
      ]),
      new Any([
        new StayWarm(),
        // set a path to NEAR fire (fail here so it returns to the beginning)
        new Fail(new SetPathToNearItem(ItemType.FIRE)),
      ]),
    ])));
  }
}
