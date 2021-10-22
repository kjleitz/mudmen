import BehaviorStatus from "@/behavior/base/BehaviorStatus";
import Blackboard from "@/behavior/base/data/Blackboard";

class BaseNode {
  public status: BehaviorStatus = BehaviorStatus.RUNNING;

  init(..._args: any[]): void {
    /* implement on classes extending this one, if desired */
  }

  // process(_local: Blackboard, _world: Blackboard): void {
  process(local: Blackboard, world: Blackboard): void {
    throw new Error("Method #process must be implemented by node classes.");
  }

  get succeeded(): boolean {
    return this.status === BehaviorStatus.SUCCESS;
  }

  get failed(): boolean {
    return this.status === BehaviorStatus.FAILURE;
  }

  get running(): boolean {
    return this.status === BehaviorStatus.RUNNING;
  }

  get finished(): boolean {
    return !this.running;
  }

  succeed(): void {
    this.status = BehaviorStatus.SUCCESS;
  }

  fail(): void {
    this.status = BehaviorStatus.FAILURE;
  }

  reset(): void {
    this.status = BehaviorStatus.RUNNING;
  }
}

export default BaseNode;
