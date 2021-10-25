import Blackboard from "@/behavior/base/data/Blackboard";
import ItemDatabase from "@/mapmaking/mudworld/ItemDatabase";
import MudworldMap from "@/mapmaking/mudworld/MudworldMap";
import Item, { ItemType } from "@/models/Item";
import Water from "@/models/items/Water";
import { closestPositioned } from "@/utilities/geo";

export interface MudworldBlackboardData {
  timestamp: number;
  map: MudworldMap;
  items: ItemDatabase;
  // itemLocations: Map<number, Map<number, Item>>;
  // itemsByType: Record<ItemType, Item[]>;
}

export default class MudworldBlackboard extends Blackboard<MudworldBlackboardData> {
  // If `this.dirty === true`, then there are unrendered changes that should be
  // rendered. Not used for changes to the map itself, but for things like item
  // positions, etc.
  // public dirty: boolean;

  constructor(data: MudworldBlackboardData) {
    super(data);
    // this.dirty = true;
  }

  // findClosestItem(itemType: ItemType, x: number, y: number): Item | undefined {
  //   return closestPositioned(x, y, this.data.itemsByType[itemType]);
  // }
}

export const mudworldItems = new ItemDatabase();
export const mudworldMap = new MudworldMap(512, 512);

mudworldMap.fillWithTerrain();

for (let i = 0; i < 100; i++) {
  const coords = mudworldMap.randomCoordsOnLand();
  mudworldItems.add(new Water(25, coords[0], coords[1]));
}
mudworldItems.add(new Water(25, 15, 50));

export const mudworld = new MudworldBlackboard({
  timestamp: 0, // will have to be set by game loop
  map: mudworldMap,
  items: mudworldItems,
  // itemsByType: {
  //   [ItemType.WATER]: [new Water(19, 13, 17)],
  //   // [ItemType.SOMETHING]: [new Something(19, 13, 17)],
  //   // [ItemType.ELSE]: [new Else(19, 13, 17)],
  //   // [ItemType.ANOTHER]: [new Another(19, 13, 17)],
  //   // [ItemType.THING]: [new Thing(19, 13, 17)],
  //   // [ItemType.ETC]: [new Etc(19, 13, 17)],
  // },
});
