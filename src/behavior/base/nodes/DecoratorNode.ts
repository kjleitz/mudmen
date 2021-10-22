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
}
