import All from "@/behavior/base/nodes/composites/All";
import Any from "@/behavior/base/nodes/composites/Any";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import Fail from "@/behavior/base/nodes/decorators/Fail";
import Repeat from "@/behavior/base/nodes/decorators/Repeat";
import Succeed from "@/behavior/base/nodes/decorators/Succeed";
import AnonMudmanNode from "@/behavior/mudman/nodes/AnonMudmanNode";
import BasicNeeds from "@/behavior/mudman/nodes/BasicNeeds";
import FindItem from "@/behavior/mudman/nodes/FindItem";
import FollowPath from "@/behavior/mudman/nodes/FollowPath";
import IsDay from "@/behavior/mudman/nodes/leaves/IsDay";
import IsHydrated from "@/behavior/mudman/nodes/leaves/IsHydrated";
import IsNearFire from "@/behavior/mudman/nodes/leaves/IsNearFire";
import IsWarm from "@/behavior/mudman/nodes/leaves/IsWarm";
import SetPathToItem from "@/behavior/mudman/nodes/leaves/SetPathToItem";
import SetPathToNearItem from "@/behavior/mudman/nodes/leaves/SetPathToNearItem";
import Move from "@/behavior/mudman/nodes/Move";
import PickUpItem from "@/behavior/mudman/nodes/PickUpItem";
import SetPathToFire from "@/behavior/mudman/nodes/SetPathToFire";
import Sit from "@/behavior/mudman/nodes/Sit";
import UseItem from "@/behavior/mudman/nodes/UseItem";
import { ItemType } from "@/models/Item";
// import Move from "@/behavior/mudman/nodes/Move";

// export default class MudmanBehavior extends DecoratorNode {
//   constructor() {
//     super(new Repeat(new All([
//       // new Move(),
//       new BasicNeeds(),
//     ])));
//   }
// }

export default class MudmanBehavior extends DecoratorNode {
  constructor() {
    super(new Repeat(new All([
      new FollowPath(),
      new Any([
        // already hydrated
        new IsHydrated(),
        // has water on hand and can use it
        new UseItem(ItemType.WATER),
        // currently at water to pick up and use
        new All([
          new PickUpItem(ItemType.WATER),
          new UseItem(ItemType.WATER),
        ]),
        // has a path to some water (fail here so it returns to the beginning)
        new Fail(new SetPathToItem(ItemType.WATER)),
      ]),
      new Any([
        // it's daytime
        new IsDay(),
        // sitting near fire
        new All([
          new IsNearFire(),
          new Sit(),
        ]),
        // has a path to fire (fail here so it returns to the beginning)
        new Fail(new SetPathToNearItem(ItemType.FIRE)),
      ]),
    ])));
  }
}
