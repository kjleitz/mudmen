import Blackboard from "@/behavior/base/data/Blackboard";
import BaseNode from "@/behavior/base/nodes/BaseNode";

export default class DecoratorNode<ChildNode extends BaseNode = BaseNode> extends BaseNode {
  public child: ChildNode;

  constructor(child: ChildNode) {
    super();
    this.child = child;
    this.child.incrementLevel();
  }

  reset(): void {
    super.reset();
    this.child.reset();
  }

  incrementLevel(): void {
    super.incrementLevel();
    this.child.incrementLevel();
  }

  process(local: Blackboard, world: Blackboard): void {
    this.child.run(local, world);
    this.status = this.child.status;
  }
}
