import CompositeNode from "../CompositeNode";
import BaseNode from "../BaseNode";

export default class All<T extends BaseNode> extends CompositeNode<T> {
  // This node succeeds if either...
  //
  //   a) all of its children succeed, or
  //   b) it has no children.
  //
  // This node fails and stops if any child fails.
  //
  // This node stops and waits if a child continues running.
  //
  process() {
    this.shuffleIfNecessary();

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      child.process();

      if (child.failed) this.fail();
      if (child.running || this.failed) return;
    }

    this.succeed();
  }
}
