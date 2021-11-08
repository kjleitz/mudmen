import Blackboard from "@/behavior/base/data/Blackboard";
import Item, { ItemType } from "@/models/Item";
import Mudman from "@/models/Mudman";
import { PathNode } from "@/pathfinding/base/PathFinder";
import { mappedSetFor } from "@/utilities/collections";
import { Coords, distanceBetween, Position, vectorBetween } from "@/utilities/geo";
import { f } from "@/utilities/math";

export interface MudmanData {
  currentX: number;
  currentY: number;
  path: PathNode[];
  unreachable: Coords[];
  size: number;
  moveSpeed: number;
  hydration: number;
  warmth: number;
  social: number;
  eyesight: number;
  inventory: Map<ItemType, Set<Item>>;
  xDirection: number;
  yDirection: number;
  sitting: boolean;
  targetedItem: Item | null;
  talkingTo: Mudman | null;
  movingTarget: Position | null; // could be anything that implements `Position`
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
      size: 16,
      moveSpeed: 5,
      hydration: 10,
      warmth: 50,
      social: 0,
      // eyesight: 200,
      eyesight: 300,
      // eyesight: 15,
      inventory: new Map(),
      xDirection: 1,
      yDirection: 1,
      sitting: false,
      targetedItem: null,
      talkingTo: null,
      movingTarget: null,
    };
  }

  get x(): number { return this.data.currentX }
  get y(): number { return this.data.currentY }

  get hasPath(): boolean { return this.data.path.length > 0 }
  get destination(): PathNode | undefined { return this.data.path[0] }

  get isNearDestination(): boolean {
    const { destination } = this;
    return destination ? this.isNear(destination.x, destination.y) : true;
  }

  get nearbyThreshold(): number { return 5 * this.data.moveSpeed }
  get crowdingThreshold(): number { return this.data.size }
  get percentHydrated(): number { return this.data.hydration / 100 }
  get percentWarm(): number { return this.data.warmth / 100 }
  get percentSocial(): number { return this.data.social / 100 }
  get talking(): boolean { return !!this.data.talkingTo }

  clearPath(): void {
    this.data.path.length = 0;
    // TODO: is this a good spot to clear the unreachables?
    this.data.unreachable.length = 0;
  }

  setCurrentPosition(x: number, y: number): void {
    x = f(x);
    y = f(y);

    this.face(x, y);

    if (this.data.currentX !== x || this.data.currentY !== y) {
      this.data.sitting = false;
      this.data.talkingTo = null;
    }

    this.data.currentX = x;
    this.data.currentY = y;
  }

  face(x: number, y: number): void {
    const { currentX, currentY } = this.data;

    if (currentX === x) {
      if (currentY !== y) this.data.xDirection = 0;
    } else {
      this.data.xDirection = currentX < x ? 1 : -1;
    }

    if (currentY !== y) this.data.yDirection = currentY < y ? 1 : -1;
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
    if (!nextPathNode) {
      // TODO: is this a good spot to clear the unreachables?
      this.data.unreachable.length = 0;
      return;
    }

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

  chill(amount = 1): void {
    this.data.warmth = Math.max(this.data.warmth - amount, 0);
  }

  toast(amount = 1): void {
    this.data.warmth = Math.min(this.data.warmth + amount, 100);
  }

  feelLonely(amount = 1): void {
    this.data.social = Math.min(this.data.social - amount, 100);
  }

  feelSocial(amount = 1): void {
    this.data.social = Math.min(this.data.social + amount, 100);
  }

  inventoryOf(itemType: ItemType): Set<Item> {
    return mappedSetFor(this.data.inventory, itemType);
  }

  isHoldingItem(item: Item): boolean {
    return this.inventoryOf(item.type).has(item);
  }

  pickUp(item: Item): void {
    if (!item.collectible) return;

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

  isUnreachable(x: number, y: number): boolean {
    // return distanceBetween(this.x, this.y, x, y) > this.data.eyesight
    //   || !!this.data.unreachable.find((coords) => coords[0] === x && coords[1] === y);
    return !!this.data.unreachable.find((coords) => coords[0] === x && coords[1] === y);
  }

  isWithinEyesight(x: number, y: number): boolean {
    return distanceBetween(this.x, this.y, x, y) <= this.data.eyesight;
  }

  isNear(x: number, y: number): boolean {
    return distanceBetween(this.x, this.y, x, y) <= this.nearbyThreshold;
  }

  isCrowding(x: number, y: number): boolean {
    return distanceBetween(this.x, this.y, x, y) <= this.crowdingThreshold;
  }

  isAt(x: number, y: number): boolean {
    return this.x === x && this.y === y;
  }

  isOneStepAwayFrom(x: number, y: number): boolean {
    return distanceBetween(this.x, this.y, x, y) <= this.data.moveSpeed;
  }

  distanceTo(x: number, y: number): number {
    return distanceBetween(this.x, this.y, x, y);
  }

  talkTo(compatriot: Mudman): void {
    // Don't talk to yourself. It's unbecoming.
    if (this === compatriot.local) return;

    const compatriotTalkingTo = compatriot.local.data.talkingTo;
    // If they're already talking to someone...
    if (compatriotTalkingTo) {
      // ...and that someone is *me,* then just talk to them. Otherwise, talk to
      // the mudman *they* are talking to.
      if (this === compatriotTalkingTo.local) {
        this.data.talkingTo = compatriot;
      } else {
        this.data.talkingTo = compatriotTalkingTo;
      }
    } else {
      // If not, then just talk to them.
      this.data.talkingTo = compatriot;
      // Also, make them face you.
      compatriot.local.face(this.x, this.y);
    }

    const { talkingTo } = this.data;
    this.face(talkingTo.local.x, talkingTo.local.y);
  }
}
