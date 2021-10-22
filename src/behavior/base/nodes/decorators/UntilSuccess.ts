import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import BaseNode from "@/behavior/base/nodes/BaseNode";
import Blackboard from "@/behavior/base/data/Blackboard";

export default class UntilSuccess<T extends BaseNode = BaseNode> extends DecoratorNode<T> {
  process(local: Blackboard, world: Blackboard): void {
    this.child.reset();
    this.child.process(local, world);
    if (this.child.succeeded) this.succeed();
  }
}
