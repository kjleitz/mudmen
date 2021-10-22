import Blackboard from "@/behavior/base/data/Blackboard";
import BaseNode from "@/behavior/base/nodes/BaseNode";

export default class BehaviorTree<
  RootNode extends BaseNode = BaseNode,
  LocalBlackboard extends Blackboard = Blackboard,
  WorldBlackboard extends Blackboard = Blackboard,
> {
  public world: WorldBlackboard;
  public local: LocalBlackboard;
  public root: RootNode;
  public current: RootNode;

  constructor(root: RootNode, local: LocalBlackboard, world: WorldBlackboard) {
    this.root = root;
    this.current = root;
    this.world = world;
    this.local = local;
  }

  tick(): void {
    this.current.process(this.local, this.world);
  }
}
