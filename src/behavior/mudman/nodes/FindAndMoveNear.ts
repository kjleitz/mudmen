import All from "@/behavior/base/nodes/composites/All";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import UntilSuccess from "@/behavior/base/nodes/decorators/UntilSuccess";
import Log from "@/behavior/base/nodes/leaves/Log";
import FindItem from "@/behavior/mudman/nodes/FindItem";
import FollowPathUntilNear from "@/behavior/mudman/nodes/FollowPathUntilNear";
import MoveNear from "@/behavior/mudman/nodes/MoveNear";
import Stop from "@/behavior/mudman/nodes/Stop";
import { ItemType } from "@/models/Item";

export default class FindAndMoveNear extends DecoratorNode {
  constructor(itemType: ItemType) {
    // super(new All([
    //   new FindItem(itemType),
    //   new MoveNear(),
    // ]));
    super(new All([
      new FindItem(itemType),
      new FollowPathUntilNear(),
    ]));
  }
}
