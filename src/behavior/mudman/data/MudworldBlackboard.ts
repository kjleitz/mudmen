import Blackboard from "@/behavior/base/data/Blackboard";
import ItemDatabase from "@/mapmaking/mudworld/ItemDatabase";
import MudworldMap from "@/mapmaking/mudworld/MudworldMap";
import Water from "@/models/items/Water";

export interface MudworldBlackboardData {
  timestamp: number;
  map: MudworldMap;
  items: ItemDatabase;
}

export default class MudworldBlackboard extends Blackboard<MudworldBlackboardData> {
  constructor(data: MudworldBlackboardData) {
    super(data);
  }
}

export const mudworldItems = new ItemDatabase();
export const mudworldMap = new MudworldMap(512, 512);

mudworldMap.fillWithTerrain();

for (let i = 0; i < 1000; i++) {
  const coords = mudworldMap.randomCoordsOnLand();
  mudworldItems.add(new Water(25, coords[0], coords[1]));
}

// mudworldItems.add(new Water(25, 325, 300));
// mudworldItems.add(new Water(25, 535, 300));

export const mudworld = new MudworldBlackboard({
  timestamp: 0,
  map: mudworldMap,
  items: mudworldItems,
});
