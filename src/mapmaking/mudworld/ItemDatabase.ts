import Item, { ItemType } from "@/models/Item";
import Bottle, { FluidType } from "@/models/items/containers/Bottle";
import Fire from "@/models/items/Fire";
// import Water from "@/models/items/Water";
import { mappedArrayFor, mappedSetFor } from "@/utilities/collections";
import { distanceBetween } from "@/utilities/geo";

type ItemConstructor<I extends Item = Item> = { new(...args: any[]): I };
type Graveyard<I extends Item = Item> = Map<ItemConstructor<I>, I[]>;

export default class ItemDatabase {
  private itemsById: Map<symbol, Item>;
  private idsByType: Map<ItemType, Set<symbol>>;
  private graveyard: Graveyard; // pool for re-using objects

  constructor() {
    this.itemsById = new Map();
    this.idsByType = new Map();
    this.graveyard = new Map();
  }

  private add(item: Item): void {
    this.itemsById.set(item.id, item);
    this.idsFor(item.type).add(item.id);
  }

  private delete(item: Item): void {
    this.itemsById.delete(item.id);
    this.idsFor(item.type).delete(item.id);
  }

  kill<I extends Item>(item: I): void {
    this.graveyardFor(item.constructor as ItemConstructor<I>).push(item);
    this.delete(item);
  }

  resurrect<I extends Item>(itemClass: ItemConstructor<I>): I | undefined {
    const zombie = this.graveyardFor(itemClass).pop();
    if (!zombie) return;

    zombie.refurbish();
    zombie.held = false;
    this.add(zombie);
    return zombie;
  }

  createBottle(filledWith: FluidType, x: number, y: number, volume?: number, content?: number): Bottle {
    let bottle = this.resurrect(Bottle);

    if (!bottle) {
      bottle = new Bottle(filledWith, x, y, volume, content);
      this.add(bottle);
      return bottle;
    }

    bottle.moveTo(x, y);
    bottle.dump();
    if (volume || volume === 0) bottle.resize(volume);
    if (content || content === 0) bottle.fillWith(filledWith, content);

    return bottle;
  }

  // createWater(volume: number, x: number, y: number): Water {
  //   const zombie = this.resurrect(Water);

  //   if (!zombie) {
  //     const water = new Water(volume, x, y);
  //     this.add(water);
  //     return water;
  //   }

  //   zombie.volume = volume;
  //   zombie.x = x;
  //   zombie.y = y;
  //   return zombie;
  // }

  createFire(x: number, y: number): Fire {
    const zombie = this.resurrect(Fire);

    if (!zombie) {
      const fire = new Fire(x, y);
      this.add(fire);
      return fire;
    }

    zombie.x = x;
    zombie.y = y;
    return zombie;
  }

  private idsFor(itemType: ItemType): Set<symbol> {
    return mappedSetFor(this.idsByType, itemType);
  }

  graveyardFor<I extends Item>(itemClass: ItemConstructor<I>): I[] {
    return mappedArrayFor(this.graveyard as Graveyard<I>, itemClass);
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
