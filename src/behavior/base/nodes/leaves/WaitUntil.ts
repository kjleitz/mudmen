import Blackboard from "@/behavior/base/data/Blackboard";
import AnonymousNode, { AnonymousNodeLambda } from "@/behavior/base/nodes/AnonymousNode";
import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import UntilSuccess from "@/behavior/base/nodes/decorators/UntilSuccess";

export default class WaitUntil<
  L extends Blackboard = Blackboard,
  W extends Blackboard = Blackboard,
> extends DecoratorNode {
  constructor(condition: AnonymousNodeLambda<L, W>) {
    super(new UntilSuccess(new AnonymousNode(condition)));
  }
}
