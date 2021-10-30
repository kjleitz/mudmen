import BehaviorStatus from "@/behavior/base/BehaviorStatus";
import Blackboard from "@/behavior/base/data/Blackboard";
import BaseNode from "@/behavior/base/nodes/BaseNode";

export interface AnonymousNodeLambda<L extends Blackboard, W extends Blackboard> {
  (local: L, world: W): boolean | undefined | null;
}

export default class AnonymousNode<
  LocalBlackboard extends Blackboard = Blackboard,
  WorldBlackboard extends Blackboard = Blackboard,
> extends BaseNode {
  public lambda: AnonymousNodeLambda<LocalBlackboard, WorldBlackboard>;

  constructor(lambda: AnonymousNodeLambda<LocalBlackboard, WorldBlackboard>) {
    super();
    this.lambda = lambda;
  }

  process(local: LocalBlackboard, world: WorldBlackboard): void {
    const result = this.lambda(local, world);

    if (result === true) {
      this.status = BehaviorStatus.SUCCESS;
    } else if (result === false) {
      this.status = BehaviorStatus.FAILURE;
    } else {
      this.status = BehaviorStatus.RUNNING;
    }
  }
}
