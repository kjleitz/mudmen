import LeafNode from "../LeafNode";

export default class Log extends LeafNode {
  public message: string;

  constructor(message: string) {
    super();
    this.message = message;
  }

  process() {
    console.log(this.message);
    this.succeed();
  }
}
