import Blackboard from "@/behavior/base/data/Blackboard";
import LeafNode from "@/behavior/base/nodes/LeafNode";

export default class Log extends LeafNode {
  public message: string;

  constructor(message: string) {
    super();
    this.message = message;
  }

  process(_local: Blackboard, _world: Blackboard): void {
    console.log(this.message);
    this.succeed();
  }
}
