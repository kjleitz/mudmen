import CompositeNode from "@/behavior/base/nodes/CompositeNode";
import BaseNode from "@/behavior/base/nodes/BaseNode";
import Blackboard from "@/behavior/base/data/Blackboard";

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
  process(local: Blackboard, world: Blackboard) {
    this.shuffleIfNecessary();

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      child.run(local, world);

      if (child.failed) this.fail();
      if (child.running || this.failed) return;
    }

    this.succeed();
  }
}
