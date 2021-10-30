import Blackboard from "@/behavior/base/data/Blackboard";
import AnonymousNode, { AnonymousNodeLambda } from "@/behavior/base/nodes/AnonymousNode";
import BaseNode from "@/behavior/base/nodes/BaseNode";
import All from "@/behavior/base/nodes/composites/All";
import Any from "@/behavior/base/nodes/composites/Any";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import Fail from "@/behavior/base/nodes/decorators/Fail";
import Succeed from "@/behavior/base/nodes/decorators/Succeed";
import NoOp from "@/behavior/base/nodes/leaves/NoOp";
import AnonMudmanNode from "@/behavior/mudman/nodes/AnonMudmanNode";
import UseOrFindAndUseItem from "@/behavior/mudman/nodes/UseOrFindAndUseItem";
import { ItemType } from "@/models/Item";

export interface ConditionLambda<L extends Blackboard, W extends Blackboard> {
  (local: L, world: W): boolean;
}

// export default class If<L extends Blackboard = Blackboard, W extends Blackboard = Blackboard> extends DecoratorNode {
//   constructor(condition: ConditionLambda<L, W>, ifNode: BaseNode, elseNode?: BaseNode) {
//     super(new Any([
//       new AnonymousNode<L, W>(condition),
//     ]))
//     super(new Any([
//       new All([
//         new AnonymousNode<L, W>(condition),
//         new Succeed(ifNode),
//       ]),
//       new Succeed(elseNode ?? new NoOp()),
//     ]));
//   }
// }


export default class If<L extends Blackboard = Blackboard, W extends Blackboard = Blackboard> extends BaseNode {
  constructor(
    public condition: ConditionLambda<L, W>,
    public ifNode: BaseNode,
    public elseNode: BaseNode,
  ) {
    super();
  }

  reset(): void {
    super.reset();
    this.ifNode.reset();
    this.elseNode.reset();
  }

  process(local: L, world: W): void {
    if (this.condition(local, world)) {
      this.ifNode.process(local, world);
      this.status = this.ifNode.status;
    } else {
      this.elseNode.process(local, world);
      this.status = this.elseNode.status;
    }
  }
}
