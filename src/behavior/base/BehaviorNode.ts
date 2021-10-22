import BehaviorStatus from "@/behavior/base/BehaviorStatus";

export default interface BehaviorNode {
  status: BehaviorStatus;

  init?<T>(...args: T[]): void;
  process(...args: any[]): void;
}
