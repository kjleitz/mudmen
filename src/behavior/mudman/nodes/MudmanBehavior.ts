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
import SetPathToTargetedItem from "@/behavior/mudman/nodes/leaves/SetPathToTargetedItem";
import HandleTargetedItem from "@/behavior/mudman/nodes/HandleTargetedItem";
import HangOut from "@/behavior/mudman/nodes/HangOut";
import SetPathToNearClosestMudman from "@/behavior/mudman/nodes/leaves/SetPathToNearClosestMudman";
import Each from "@/behavior/base/nodes/composites/Each";
import Dehydrate from "@/behavior/mudman/nodes/leaves/Dehydrate";
import IsNearFire from "@/behavior/mudman/nodes/leaves/IsNearFire";
import Toast from "@/behavior/mudman/nodes/leaves/Toast";
import IsDay from "@/behavior/mudman/nodes/leaves/IsDay";
import Succeed from "@/behavior/base/nodes/decorators/Succeed";
import IsNight from "@/behavior/mudman/nodes/leaves/IsNight";
import Chill from "@/behavior/mudman/nodes/leaves/Chill";
import IsTalking from "@/behavior/mudman/nodes/leaves/IsTalking";
import IsTalkingToNearbyMudman from "@/behavior/mudman/nodes/leaves/IsTalkingToNearbyMudman";
import IsTalkingToFarOffMudman from "@/behavior/mudman/nodes/leaves/IsTalkingToFarOffMudman";
import StopTalking from "@/behavior/mudman/nodes/leaves/StopTalking";
import ChaseMovingTarget from "@/behavior/mudman/nodes/leaves/ChaseMovingTarget";
import ClearMovingTarget from "@/behavior/mudman/nodes/leaves/ClearMovingTarget";
import GetUp from "@/behavior/mudman/nodes/leaves/GetUp";
import MakeRoomForOthers from "@/behavior/mudman/nodes/MakeRoomForOthers";
import FeelSocial from "@/behavior/mudman/nodes/leaves/FeelSocial";
import FeelLonely from "@/behavior/mudman/nodes/leaves/FeelLonely";
import IsNotLonely from "@/behavior/mudman/nodes/leaves/IsNotLonely";

export default class MudmanBehavior extends DecoratorNode {
  constructor() {
    super(new Repeat(new All([
      new Repeat(new Each([
        new Dehydrate(0.1),
        new All([
          new IsDay(),
          new Toast(0.1),
        ]),
        new Any([
          new All([
            new IsNearFire(),
            new Toast(0.5),
          ]),
          new All([
            new IsNight(),
            new Chill(0.5),
          ]),
        ]),
        new All([
          new IsTalking(),
          new Any([
            new All([
              new IsTalkingToFarOffMudman(),
              new StopTalking(),
            ]),
            // new All([
            //   new IsTalkingToNearbyMudman(),
            //   new KeepTalking(),
            // ]),
          ]),
        ]),
        new Any([
          new All([
            new IsTalking(),
            new FeelSocial(1),
          ]),
          new FeelLonely(0.1),
        ]),
        new ChaseMovingTarget(),
        new MakeRoomForOthers(),
      ])),
      new FollowPath(),
      new Any([
        new All([
          new Any([
            new HandleTargetedItem(),
            // set a path to the targeted item (fail here so it returns to the beginning)
            new Fail(new SetPathToTargetedItem()),
          ]),
          new Any([
            new StayHydrated(),
            // set a path to some water (fail here so it returns to the beginning)
            new Fail(new SetPathToItem(ItemType.BOTTLE)),
          ]),
          new Any([
            new StayWarm(),
            // set a path to NEAR fire (fail here so it returns to the beginning)
            new Fail(new SetPathToNearItem(ItemType.FIRE)),
          ]),
        ]),
        new Fail(new Each([
          new ClearMovingTarget(),
          new StopTalking(),
          new GetUp(),
          new Fail(),
        ])),
      ]),
      new Any([
        new IsNotLonely(),
        new HangOut(),
      ]),
      // new Any([
      //   new HangOut(),
      //   // set a path to NEAR fire (fail here so it returns to the beginning)
      //   new Fail(new SetPathToNearClosestMudman()),
      // ]),
    ])));
  }
}
