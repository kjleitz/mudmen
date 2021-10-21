import BehaviorStatus from "./BehaviorStatus";

export default interface BehaviorNode {
  status: BehaviorStatus;

  init?<T>(...args: T[]): void;
  process(...args: any[]): void;
}
