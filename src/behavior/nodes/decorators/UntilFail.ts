import BaseNode from "../BaseNode";
import DecoratorNode from "../DecoratorNode";

export default class UntilFail<T extends BaseNode> extends DecoratorNode<T> {
  process() {
    this.child.reset();
    this.child.process();
    if (this.child.failed) this.succeed();
  }
}
