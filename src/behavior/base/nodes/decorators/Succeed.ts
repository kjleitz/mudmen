import Blackboard from "@/behavior/base/data/Blackboard";
import BaseNode from "@/behavior/base/nodes/BaseNode";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";

export default class Succeed<T extends BaseNode = BaseNode> extends DecoratorNode<T> {
  process(local: Blackboard, world: Blackboard): void {
    this.child.process(local, world);
    this.succeed();
  }
}
