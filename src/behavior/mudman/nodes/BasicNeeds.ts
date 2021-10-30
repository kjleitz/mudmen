import All from "@/behavior/base/nodes/composites/All";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import SatisfyThirst from "@/behavior/mudman/nodes/SatisfyThirst";
import SatisfyWarmth from "@/behavior/mudman/nodes/SatisfyWarmth";

export default class BasicNeeds extends DecoratorNode {
  constructor() {
    super(new All([
      // new SatisfyWaste(),
      // new SatisfyThirst(),
      new SatisfyWarmth(),
      // new SatisfyHunger(),
      // new SatisfySleep(),
    ]));
  }
}
