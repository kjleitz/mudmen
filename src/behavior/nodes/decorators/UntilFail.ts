import BehaviorNode, { BehaviorStatus } from "../BehaviorNode";
import DecoratorNode from "../DecoratorNode";

export default class UntilFail<T extends BehaviorNode> extends DecoratorNode<T> {
  process() {
    this.child.process();
    if (this.child.status === BehaviorStatus.FAILURE) this.status = BehaviorStatus.SUCCESS;
  }
}
