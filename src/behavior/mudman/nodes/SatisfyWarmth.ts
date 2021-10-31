import All from "@/behavior/base/nodes/composites/All";
import Any from "@/behavior/base/nodes/composites/Any";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import Fail from "@/behavior/base/nodes/decorators/Fail";
import Succeed from "@/behavior/base/nodes/decorators/Succeed";
import If from "@/behavior/base/nodes/If";
import Log from "@/behavior/base/nodes/leaves/Log";
import Wait from "@/behavior/base/nodes/leaves/Wait";
import WaitUntil from "@/behavior/base/nodes/leaves/WaitUntil";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import AnonMudmanNode from "@/behavior/mudman/nodes/AnonMudmanNode";
import FindAndMoveNear from "@/behavior/mudman/nodes/FindAndMoveNear";
import FindItem from "@/behavior/mudman/nodes/FindItem";
import FollowPathUntilNear from "@/behavior/mudman/nodes/FollowPathUntilNear";
import Sit from "@/behavior/mudman/nodes/Sit";
import { ItemType } from "@/models/Item";

// const needToFindFire = (local: MudmanBlackboard, world: MudworldBlackboard): boolean => {
//   return world.isNight;
//   // console.log("here")
//   // if (world.isDay) return false;

//   // console.log("here2")
//   // const closestFire = world.data.items.findClosest(ItemType.FIRE, local.x, local.y);
//   // console.log("here3")
//   // if (!closestFire) return false;

//   // console.log("here4")
//   // if (local.isNear(closestFire.x, closestFire.y)) {
//   //   console.log("here5")
//   //   // local.data.sitting = true;
//   //   return false;
//   // }

//   // console.log("here6")
//   // return true;
// };

export default class SatisfyWarmth extends DecoratorNode {
  constructor() {
    // super(new If(
    //   needToFindFire,
    //   new All([
    //     new FindAndMoveNear(ItemType.FIRE),
    //     new Sit(),
    //     new Wait(),
    //   ]),
    //   new Succeed(),
    // ));
    // super(new Any([
    //   new AnonMudmanNode((_local, world) => world.isDay),
    //   new All([
    //     new FindAndMoveNear(ItemType.FIRE),
    //     new Sit(),
    //     // new Wait(),
    //     new Fail(), // needs to fail in order to "finish" and re-run
    //     // new WaitUntil<MudmanBlackboard, MudworldBlackboard>((_local, world) => world.isDay),
    //   ]),
    // ]));
    super(new Any([
      new AnonMudmanNode((_local, world) => world.isDay),
      new Any([
        new All([
          new AnonMudmanNode(local => local.isNearDestination),
          new Sit(),
        ]),
        new All([
          new FindItem(ItemType.FIRE),
          new FollowPathUntilNear(),
          new Sit(),
          // new Wait(),
          new Fail(), // needs to fail in order to "finish" and re-run
          // new WaitUntil<MudmanBlackboard, MudworldBlackboard>((_local, world) => world.isDay),
        ]),
      ]),
    ]));
  }
}
