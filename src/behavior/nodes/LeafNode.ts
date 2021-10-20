import BehaviorNode, { BehaviorStatus } from "./BehaviorNode";

export default class LeafNode implements BehaviorNode {
  public status = BehaviorStatus.RUNNING;

  process(..._args: any[]) {
    throw new Error("Method #process must be implemented on classes extending LeafNode");
  }
}
