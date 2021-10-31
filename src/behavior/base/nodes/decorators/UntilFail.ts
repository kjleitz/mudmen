import Blackboard from "@/behavior/base/data/Blackboard";
import BaseNode from "@/behavior/base/nodes/BaseNode";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";

export default class UntilFail<T extends BaseNode = BaseNode> extends DecoratorNode<T> {
  process(local: Blackboard, world: Blackboard): void {
    this.child.reset();
    this.child.run(local, world);
    if (this.child.failed) this.succeed();
  }
}
