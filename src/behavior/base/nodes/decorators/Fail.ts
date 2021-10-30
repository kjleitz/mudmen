import Blackboard from "@/behavior/base/data/Blackboard";
import BaseNode from "@/behavior/base/nodes/BaseNode";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import NoOp from "@/behavior/base/nodes/leaves/NoOp";

export default class Fail<T extends BaseNode = BaseNode> extends DecoratorNode {
  constructor(child?: T) {
    super(child ?? new NoOp());
  }

  process(local: Blackboard, world: Blackboard): void {
    this.child.process(local, world);
    this.fail();
  }
}
