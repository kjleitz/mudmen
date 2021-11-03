import BehaviorStatus from "@/behavior/base/BehaviorStatus";
import Blackboard from "@/behavior/base/data/Blackboard";

export default class BaseNode {
  public static debug = false;
  // public static debug = true;

  public status: BehaviorStatus = BehaviorStatus.RUNNING;
  public level = 0;

  init(..._args: any[]): void {
    /* implement on classes extending this one, if desired */
  }

  process(_local: Blackboard, _world: Blackboard): void {
    throw new Error("Method #process must be implemented by node classes.");
  }

  run(local: Blackboard, world: Blackboard): void {
    if (BaseNode.debug) {
      const indent = ' |'.repeat(this.level);
      console.log(`${indent}Processing node: ${this.constructor.name}`);
      this.process(local, world);
      console.log(`${indent}Processed. Result: ${this.status}`);
    } else {
      this.process(local, world);
    }
  }

  incrementLevel(): void {
    this.level += 1;
    // console.log(this.constructor.name, this.level)
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
