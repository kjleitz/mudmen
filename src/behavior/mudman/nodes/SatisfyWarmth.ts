import All from "@/behavior/base/nodes/composites/All";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import Succeed from "@/behavior/base/nodes/decorators/Succeed";
import If from "@/behavior/base/nodes/If";
import Log from "@/behavior/base/nodes/leaves/Log";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import FindAndMoveNear from "@/behavior/mudman/nodes/FindAndMoveNear";
import Sit from "@/behavior/mudman/nodes/Sit";
import { ItemType } from "@/models/Item";

const needToFindFire = (local: MudmanBlackboard, world: MudworldBlackboard): boolean => {
  return world.isNight;
  // console.log("here")
  // if (world.isDay) return false;
  
  // console.log("here2")
  // const closestFire = world.data.items.findClosest(ItemType.FIRE, local.x, local.y);
  // console.log("here3")
  // if (!closestFire) return false;
  
  // console.log("here4")
  // if (local.isNear(closestFire.x, closestFire.y)) {
  //   console.log("here5")
  //   // local.data.sitting = true;
  //   return false;
  // }
  
  // console.log("here6")
  // return true;
};

export default class SatisfyWarmth extends DecoratorNode {
  constructor() {
    super(new If(
      needToFindFire,
      new All([
        new FindAndMoveNear(ItemType.FIRE),
        new Sit(),
      ]),
      new Succeed(),
    ));
  }
}
