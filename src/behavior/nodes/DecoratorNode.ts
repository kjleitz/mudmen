import BehaviorNode, { BehaviorStatus } from "./BehaviorNode";

export default class DecoratorNode<ChildNode extends BehaviorNode = BehaviorNode> implements BehaviorNode {
  public child: ChildNode;
  public status = BehaviorStatus.RUNNING;

  constructor(child: ChildNode) {
    this.child = child;
  }

  process() {
    throw new Error("Method #process must be implemented on classes extending DecoratorNode");
  }
}
