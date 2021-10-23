import Blackboard from "@/behavior/base/data/Blackboard";
import MudworldMap from "@/mapmaking/mudworld/MudworldMap";
import Item, { ItemType } from "@/models/Item";
import Water from "@/models/items/Water";
import { closestPositioned } from "@/utilities/geo";

export default class MudworldBlackboard extends Blackboard<{
  timestamp: number;
  map: MudworldMap;
  itemsByType: Record<ItemType, Item[]>
}> {
  findClosestItem(itemType: ItemType, x: number, y: number): Item | undefined {
    return closestPositioned(x, y, this.data.itemsByType[itemType]);
  }
}

export const mudworldMap = new MudworldMap(512, 512);
mudworldMap.fillWithTerrain();

export const mudworld = new MudworldBlackboard({
  timestamp: 0, // will have to be set by game loop
  map: mudworldMap,
  itemsByType: {
    [ItemType.WATER]: [new Water(19, 13, 17)],
    // [ItemType.SOMETHING]: [new Something(19, 13, 17)],
    // [ItemType.ELSE]: [new Else(19, 13, 17)],
    // [ItemType.ANOTHER]: [new Another(19, 13, 17)],
    // [ItemType.THING]: [new Thing(19, 13, 17)],
    // [ItemType.ETC]: [new Etc(19, 13, 17)],
  },
});
