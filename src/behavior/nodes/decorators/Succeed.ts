import BaseNode from "../BaseNode";
import DecoratorNode from "../DecoratorNode";

export default class Succeed<T extends BaseNode> extends DecoratorNode<T> {
  process() {
    this.child.process();
    this.succeed();
  }
}
