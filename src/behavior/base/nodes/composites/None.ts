import CompositeNode from "@/behavior/base/nodes/CompositeNode";
import BaseNode from "@/behavior/base/nodes/BaseNode";
import Blackboard from "@/behavior/base/data/Blackboard";

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
  process(local: Blackboard, world: Blackboard): void {
    this.shuffleIfNecessary();

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      child.process(local, world);

      if (child.succeeded) this.fail();
      if (child.running || this.failed) return;
    }

    this.succeed();
  }
}
