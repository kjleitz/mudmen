import Blackboard from "@/behavior/base/data/Blackboard";
import ItemDatabase from "@/mapmaking/mudworld/ItemDatabase";
import MudworldMap from "@/mapmaking/mudworld/MudworldMap";
import Water from "@/models/items/Water";
import Mudman from "@/models/Mudman";

export interface MudworldBlackboardData {
  timestamp: number;
  map: MudworldMap;
  items: ItemDatabase;
  mudmen: Mudman[];
}

export default class MudworldBlackboard extends Blackboard<MudworldBlackboardData> {
  constructor(data: MudworldBlackboardData) {
    super(data);
  }
}

export const mudworldItems = new ItemDatabase();
export const mudworldMap = new MudworldMap(512, 512, 4);

mudworldMap.fillWithTerrain();

// const WATERS = 500;
const WATERS = 1000;

for (let i = 0; i < WATERS; i++) {
  const coords = mudworldMap.randomCoordsOnLand();
  mudworldItems.add(new Water(25, coords[0], coords[1]));
}

// mudworldItems.add(new Water(25, 325, 300));
// mudworldItems.add(new Water(25, 535, 300));

export const mudworld = new MudworldBlackboard({
  timestamp: 0,
  map: mudworldMap,
  items: mudworldItems,
  mudmen: [],
});
