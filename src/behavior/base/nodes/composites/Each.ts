import CompositeNode from "@/behavior/base/nodes/CompositeNode";
import BaseNode from "@/behavior/base/nodes/BaseNode";
import Blackboard from "@/behavior/base/data/Blackboard";

export default class Each<T extends BaseNode> extends CompositeNode<T> {
  // This node succeeds and stops once all children either succeed or fail.
  //
  // This node never fails.
  //
  // This node stops and waits if a child continues running.
  //
  process(local: Blackboard, world: Blackboard): void {
    this.shuffleIfNecessary();

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      child.process(local, world);

      if (child.running) return;
    }

    this.succeed();
  }
}
