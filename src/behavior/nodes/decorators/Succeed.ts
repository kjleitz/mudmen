import BehaviorNode, { BehaviorStatus } from "../BehaviorNode";
import DecoratorNode from "../DecoratorNode";

export default class Succeed<T extends BehaviorNode> extends DecoratorNode<T> {
  process() {
    this.child.process();
    this.status = BehaviorStatus.SUCCESS;
  }
}
