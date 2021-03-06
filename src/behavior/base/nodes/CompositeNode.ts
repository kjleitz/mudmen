import { shuffleInPlace } from "@/utilities/collections";
import BaseNode from "@/behavior/base/nodes/BaseNode";

export interface CompositeNodeOptions {
  shuffle?: boolean;
}

export default class CompositeNode<
  ChildNode extends BaseNode = BaseNode,
  Options extends CompositeNodeOptions = CompositeNodeOptions
> extends BaseNode {
  public children: ChildNode[];
  public shuffle = false;

  constructor(...args: [options: Options, children: ChildNode[]]);
  constructor(...args: [children: ChildNode[]]);
  constructor(...args: [options: Options, children: ChildNode[]] | [children: ChildNode[]]) {
    super();

    if (args.length === 1) {
      this.shuffle = false;
      this.children = args[0];
    } else {
      this.shuffle = args[0].shuffle ?? false;
      this.children = args[1];
    }

    this.children.forEach(child => child.incrementLevel());
  }

  reset(): void {
    super.reset();
    this.children.forEach((child) => { child.reset() });
  }

  incrementLevel(): void {
    super.incrementLevel();
    this.children.forEach(child => child.incrementLevel());
  }

  shuffleIfNecessary(): void {
    if (this.shuffle) shuffleInPlace(this.children);
  }
}
