import Blackboard from "@/behavior/base/data/Blackboard";
import LeafNode from "@/behavior/base/nodes/LeafNode";

export default class Log extends LeafNode {
  process(_local: Blackboard, _world: Blackboard): void {
    // don't do anything and it'll keep running
  }
}
