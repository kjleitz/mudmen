import BehaviorNode, { BehaviorStatus } from "../BehaviorNode";
import DecoratorNode from "../DecoratorNode";

export default class Repeat<T extends BehaviorNode> extends DecoratorNode<T> {
  process() {
    this.child.process();
    this.status = BehaviorStatus.RUNNING;
  }
}
