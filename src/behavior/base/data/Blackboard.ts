export default class Blackboard<Data extends Record<string, any> = Record<string, any>> {
  public data: Data;

  constructor(data: Data) {
    this.data = data;
  }
}
