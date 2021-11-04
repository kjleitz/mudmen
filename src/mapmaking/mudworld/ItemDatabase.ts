import Item, { ItemType } from "@/models/Item";
import { distanceBetween } from "@/utilities/geo";

export default class ItemDatabase {
  private itemsById: Map<symbol, Item>;
  private idsByType: Map<ItemType, Set<symbol>>;

  constructor() {
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

  findOfType(itemType: ItemType, test: (item: Item) => boolean): Item | undefined {
    const idIterator = this.idsFor(itemType).values();
    let entry = idIterator.next();

    while (!entry.done) {
      const item = this.find(entry.value);
      if (test(item)) return item;

      entry = idIterator.next();
    }
  }

  // Careful; this goes through _all_ items
  findInAllItems(test: (item: Item) => boolean): Item | undefined {
    const itemIterator = this.itemsById.values();
    let entry = itemIterator.next();

    while (!entry.done) {
      if (test(entry.value)) return entry.value;

      entry = itemIterator.next();
    }
  }

  findClosest(itemType: ItemType, x: number, y: number, filter?: (item: Item) => boolean): Item | undefined {
    let closestItem: Item | undefined = undefined;
    let closestDistance: number;

    const itemOnSpot = this.findOfType(itemType, (item) => {
      if (item.held || (filter && !filter(item))) return false;
      if (item.x === x && item.y === y) return true;

      const distance = distanceBetween(x, y, item.x, item.y);
      closestItem ??= item;
      closestDistance ??= distance;

      if (distance < closestDistance) {
        closestDistance = distance;
        closestItem = item;
      }

      return false;
    });

    return itemOnSpot ?? closestItem;
  }

  // Careful; this goes through _all_ items
  itemAt(x: number, y: number, radius: number, filter?: (item: Item) => boolean): Item | undefined {
    let closestItem: Item | undefined = undefined;
    let closestDistance = radius + 1; // i am gemius

    const itemOnSpot = this.findInAllItems((item) => {
      if (item.held || (filter && !filter(item))) return false;
      if (item.x === x && item.y === y) return true;

      const distance = distanceBetween(x, y, item.x, item.y);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestItem = item;
      }

      return false;
    });

    return itemOnSpot ?? closestItem;
  }
}
