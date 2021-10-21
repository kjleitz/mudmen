import DecoratorNode from "../DecoratorNode";
import BaseNode from "../BaseNode";

export default class UntilSuccess<T extends BaseNode> extends DecoratorNode<T> {
  process() {
    this.child.reset();
    this.child.process();
    if (this.child.succeeded) this.succeed();
  }
}
