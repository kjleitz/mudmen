export const enum BehaviorStatus {
  RUNNING,
  SUCCESS,
  FAILURE,
}

export default interface BehaviorNode {
  children?: BehaviorNode[];
  status: BehaviorStatus;

  init?<T>(...args: T[]): void;
  process(...args: any[]): void;
}
