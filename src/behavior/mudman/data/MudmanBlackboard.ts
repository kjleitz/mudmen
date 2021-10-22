import Blackboard from "@/behavior/base/data/Blackboard";
import Item from "@/models/Item";
import { vectorBetween } from "@/utilities/geo";

export interface MudmanData {
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  moveSpeed: number;
  hydration: number;
  inventory: Item[];
}

export default class MudmanBlackboard extends Blackboard<MudmanData> {
  constructor(data?: MudmanData) {
    super(data ?? MudmanBlackboard.defaults)
  }

  static get defaults(): MudmanData {
    return {
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0,
      moveSpeed: 10,
      hydration: 10,
      inventory: [],
    };
  }

  get x(): number { return this.data.currentX }
  get y(): number { return this.data.currentY }

  get isAtTarget(): boolean {
    const { currentX, currentY, targetX, targetY } = this.data;
    return currentX === targetX && currentY === targetY;
  }

  setTarget(x: number, y: number): void {
    this.data.targetX = x;
    this.data.targetY = y;
  }

  setCurrentPosition(x: number, y: number): void {
    this.data.currentX = x;
    this.data.currentY = y;
  }

  moveToward(x: number, y: number): void {
    const { currentX, currentY, moveSpeed } = this.data;

    const vector = vectorBetween(currentX, currentY, x, y);
    const vectorX = vector[0];
    const vectorY = vector[1];
    const totalDistance = Math.sqrt((vectorX ** 2) + (vectorY ** 2));
    const scale = (moveSpeed > totalDistance) ? 1 : (moveSpeed / totalDistance);
    const dx = scale * vectorX;
    const dy = scale * vectorY;

    this.setCurrentPosition(currentX + dx, currentY + dy);
  }

  moveTowardTarget(): void {
    this.moveToward(this.data.targetX, this.data.targetY);
  }
}
