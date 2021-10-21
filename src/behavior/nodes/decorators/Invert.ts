import BaseNode from "../BaseNode";
import DecoratorNode from "../DecoratorNode";

export default class Invert<T extends BaseNode> extends DecoratorNode<T> {
  process() {
    this.child.process();
    if (this.child.failed) this.succeed();
    else if (this.child.succeeded) this.fail();
  }
}
