import Item, { ItemType } from "@/models/Item";
import { distanceBetween } from "@/utilities/geo";

export default class ItemDatabase {
  // private locations: Map<number, Map<number, Item>>;
  private itemsById: Map<symbol, Item>;
  private idsByType: Map<ItemType, Set<symbol>>;

  constructor() {
    // this.locations = new Map();
    this.itemsById = new Map();
    this.idsByType = new Map();
  }

  idsFor(itemType: ItemType): Set<symbol> {
    let ids = this.idsByType.get(itemType);

    if (!ids) {
      ids = new Set();
      this.idsByType.set(itemType, ids);
    }

    return ids;
  }

  add(item: Item): void {
    this.itemsById.set(item.id, item);
    this.idsFor(item.type).add(item.id);
  }

  find(id: symbol): Item {
    const item = this.itemsById.get(id);
    if (!item) throw new Error("No item registered for the given ID");
    return item;
  }

  forEachOfType(itemType: ItemType, mapper: (item: Item) => void): void {
    this.idsFor(itemType).forEach((id) => {
      mapper(this.find(id));
    });
  }

  findOfType(itemType: ItemType, mapper: (item: Item) => boolean): Item | undefined {
    const idIterator = this.idsFor(itemType).values();
    let entry = idIterator.next();

    while (!entry.done) {
      const item = this.find(entry.value);
      if (mapper(item)) return item;

      entry = idIterator.next();
    }
  }

  findClosest(itemType: ItemType, x: number, y: number): Item | undefined {
    let closestItem: Item | undefined = undefined;
    let closestDistance: number;

    this.forEachOfType(itemType, (item) => {
      if (item.held) return;

      const distance = distanceBetween(x, y, item.x, item.y);
      closestItem ??= item;
      closestDistance ??= distance;

      if (distance < closestDistance) {
        closestDistance = distance;
        closestItem = item;
      }
    });

    return closestItem;
  }

  findClosestUnused(itemType: ItemType, x: number, y: number): Item | undefined {
    let closestItem: Item | undefined = undefined;
    let closestDistance: number;

    this.forEachOfType(itemType, (item) => {
      const distance = distanceBetween(x, y, item.x, item.y);
      closestItem ??= item;
      closestDistance ??= distance;

      if (distance < closestDistance) {
        closestDistance = distance;
        closestItem = item;
      }
    });

    return closestItem;
  }
}
