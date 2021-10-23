import Blackboard from "@/behavior/base/data/Blackboard";
import BaseNode from "@/behavior/base/nodes/BaseNode";

export default class DecoratorNode<ChildNode extends BaseNode = BaseNode> extends BaseNode {
  public child: ChildNode;

  constructor(child: ChildNode) {
    super();
    this.child = child;
  }

  reset(): void {
    super.reset();
    this.child.reset();
  }

  process(local: Blackboard, world: Blackboard): void {
    this.child.process(local, world);
    this.status = this.child.status;
  }
}
