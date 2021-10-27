import Blackboard from "@/behavior/base/data/Blackboard";
import Item, { ItemType } from "@/models/Item";
import { PathNode } from "@/pathfinding/base/PathFinder";
import { Coords, distanceBetween, vectorBetween } from "@/utilities/geo";

export interface MudmanData {
  currentX: number;
  currentY: number;
  path: PathNode[];
  unreachable: Coords[];
  moveSpeed: number;
  hydration: number;
  eyesight: number;
  inventory: Map<ItemType, Set<Item>>;
}

export default class MudmanBlackboard extends Blackboard<MudmanData> {
  constructor(data?: MudmanData) {
    super(data ?? MudmanBlackboard.defaults);
  }

  static get defaults(): MudmanData {
    return {
      currentX: 0,
      currentY: 0,
      path: [],
      unreachable: [],
      moveSpeed: 10,
      hydration: 10,
      // eyesight: 200,
      eyesight: 300,
      inventory: new Map(),
    };
  }

  get x(): number { return this.data.currentX }
  get y(): number { return this.data.currentY }

  get hasPath(): boolean { return this.data.path.length > 0 }

  setCurrentPosition(x: number, y: number): void {
    this.data.currentX = Math.floor(x);
    this.data.currentY = Math.floor(y);
  }

  moveToward(x: number, y: number, speed?: number): void {
    const { currentX, currentY } = this.data;
    const moveSpeed = speed ?? this.data.moveSpeed;

    const vector = vectorBetween(currentX, currentY, x, y);
    const vectorX = vector[0];
    const vectorY = vector[1];
    const totalDistance = Math.sqrt((vectorX ** 2) + (vectorY ** 2));
    const scale = (moveSpeed > totalDistance) ? 1 : (moveSpeed / totalDistance);
    const dx = scale * vectorX;
    const dy = scale * vectorY;

    this.setCurrentPosition(currentX + dx, currentY + dy);
  }

  followPath(speedLimit?: number): void {
    const { path } = this.data;
    const moveSpeed = speedLimit ?? this.data.moveSpeed;
    const nextPathNode = path[path.length - 1];
    if (!nextPathNode) return;

    if (nextPathNode.x === this.x && nextPathNode.y === this.y) {
      path.pop();
      this.followPath(moveSpeed);
      return;
    }

    const distanceToNode = distanceBetween(this.x, this.y, nextPathNode.x, nextPathNode.y);
    if (distanceToNode > moveSpeed) {
      this.moveToward(nextPathNode.x, nextPathNode.y, moveSpeed);
    } else if (distanceToNode <= moveSpeed) {
      this.setCurrentPosition(nextPathNode.x, nextPathNode.y);
      path.pop();
      this.followPath(moveSpeed - distanceToNode);
    }
  }

  dehydrate(amount = 1): void {
    this.data.hydration = Math.max(this.data.hydration - amount, 0);
  }

  hydrate(amount = 1): void {
    this.data.hydration = Math.min(this.data.hydration + amount, 100);
  }

  inventoryOf(itemType: ItemType): Set<Item> {
    let items = this.data.inventory.get(itemType);

    if (!items) {
      items = new Set();
      this.data.inventory.set(itemType, items);
    }

    return items;
  }

  pickUp(item: Item): void {
    item.held = true;
    this.inventoryOf(item.type).add(item);
  }

  unusedFromInventory(itemType: ItemType): Item | undefined {
    const itemsIterator = this.inventoryOf(itemType).values();
    let entry = itemsIterator.next();

    while (!entry.done) {
      if (!entry.value.used) return entry.value;
      entry = itemsIterator.next();
    }
  }
}
