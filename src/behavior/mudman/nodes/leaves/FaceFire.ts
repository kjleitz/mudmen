import DecoratorNode from "@/behavior/base/nodes/DecoratorNode";
import FaceItem from "@/behavior/mudman/nodes/leaves/FaceItem";
import { ItemType } from "@/models/Item";

export default class FaceFire extends DecoratorNode {
  constructor() {
    super(new FaceItem(ItemType.FIRE));
  }
}
