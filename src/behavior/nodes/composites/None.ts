import CompositeNode from "../CompositeNode";
import BaseNode from "../BaseNode";

export default class None<T extends BaseNode> extends CompositeNode<T> {
  // This node succeeds if either...
  //
  //   a) all of its children fail, or
  //   b) it has no children.
  //
  // This node fails and stops if any child succeeds.
  //
  // This node stops and waits if a child continues running.
  //
  process() {
    this.shuffleIfNecessary();

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      child.process();

      if (child.succeeded) this.fail();
      if (child.running || this.failed) return;
    }

    this.succeed();
  }
}
