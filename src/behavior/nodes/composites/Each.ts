import CompositeNode from "../CompositeNode";
import BaseNode from "../BaseNode";

export default class Each<T extends BaseNode> extends CompositeNode<T> {
  // This node succeeds and stops once all children either succeed or fail.
  //
  // This node never fails.
  //
  // This node stops and waits if a child continues running.
  //
  process() {
    this.shuffleIfNecessary();

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      child.process();

      if (child.running) return;
    }

    this.succeed();
  }
}
