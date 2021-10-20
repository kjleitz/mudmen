import BehaviorNode, { BehaviorStatus } from "../BehaviorNode";
import DecoratorNode from "../DecoratorNode";

export default class Invert<T extends BehaviorNode> extends DecoratorNode<T> {
  process() {
    this.child.process();
    if (this.child.status === BehaviorStatus.FAILURE) this.status = BehaviorStatus.SUCCESS;
    if (this.child.status === BehaviorStatus.SUCCESS) this.status = BehaviorStatus.FAILURE;
  }
}
