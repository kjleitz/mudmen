import AnonymousNode from "@/behavior/base/nodes/AnonymousNode";

export default class NoOp extends AnonymousNode {
  constructor() {
    super(() => null);
  }
}
