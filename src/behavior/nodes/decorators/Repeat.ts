import BaseNode from "../BaseNode";
import DecoratorNode from "../DecoratorNode";

export default class Repeat<T extends BaseNode> extends DecoratorNode<T> {
  public times: number;
  public repeated: number = 0;

  // Repeats the given child node, ignoring whether it succeeds or fails. Once
  // finished, this node will succeed. If a number `times` is given, it will
  // repeat the child node that many times. If no number is given, it will
  // repeat indefinitely and never finish.
  constructor(...args: [times: number, child: T]);
  constructor(...args: [child: T]);
  constructor(...args: [times: number, child: T] | [child: T]) {
    super(args.length === 1 ? args[0] : args[1]);

    if (args.length === 1) {
      this.times = -1;
      this.child = args[0];
    } else {
      this.times = args[0];
      this.child = args[1];
    }
  }

  process() {
    if (this.times >= 0 && this.repeated >= this.times) {
      this.succeed();
    } else {
      this.child.reset();
      this.child.process();
      this.repeated += 1;
    }
  }
}
