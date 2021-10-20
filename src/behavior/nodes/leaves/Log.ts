import BehaviorNode, { BehaviorStatus } from "../BehaviorNode";
import LeafNode from "../LeafNode";

export default class Log extends LeafNode {
  process(message: string) {
    console.log(message);
    this.status = BehaviorStatus.SUCCESS;
  }
}
