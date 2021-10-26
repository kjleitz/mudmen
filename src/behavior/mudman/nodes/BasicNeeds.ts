import All from "@/behavior/base/nodes/composites/All";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import SatisfyThirst from "@/behavior/mudman/nodes/SatisfyThirst";

export default class BasicNeeds extends DecoratorNode {
  constructor() {
    super(new All([
      // new SatisfyWaste(),
      new SatisfyThirst(),
      // new SatisfyHunger(),
      // new SatisfySleep(),
    ]));
  }
}
