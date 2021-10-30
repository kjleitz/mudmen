import All from "@/behavior/base/nodes/composites/All";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import Repeat from "@/behavior/base/nodes/decorators/Repeat";
import BasicNeeds from "@/behavior/mudman/nodes/BasicNeeds";
// import Move from "@/behavior/mudman/nodes/Move";

export default class MudmanBehavior extends DecoratorNode {
  constructor() {
    super(new Repeat(new All([
      // new Move(),
      new BasicNeeds(),
    ])));
  }
}
