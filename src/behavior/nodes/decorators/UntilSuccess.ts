import BehaviorNode, { BehaviorStatus } from "../BehaviorNode";
import DecoratorNode from "../DecoratorNode";

export default class UntilSuccess<T extends BehaviorNode> extends DecoratorNode<T> {
  process() {
    this.child.process();
    if (this.child.status === BehaviorStatus.SUCCESS) this.status = BehaviorStatus.SUCCESS;
  }
}
