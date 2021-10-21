import CompositeNode from "../CompositeNode";
import BaseNode from "../BaseNode";

export default class Any<T extends BaseNode> extends CompositeNode<T> {
  // This node succeeds and stops if any child succeeds.
  //
  // This node fails if either...
  //
  //   a) all of its children fail, or
  //   b) it has no children.
  //
  // This node stops and waits if a child continues running.
  //
  process() {
    this.shuffleIfNecessary();

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      child.process();

      if (child.succeeded) this.succeed();
      if (child.running || this.succeeded) return;
    }

    this.fail();
  }
}
