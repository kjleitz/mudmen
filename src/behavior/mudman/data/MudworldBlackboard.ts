import Blackboard from "@/behavior/base/data/Blackboard";
import ItemDatabase from "@/mapmaking/mudworld/ItemDatabase";
import MudworldMap from "@/mapmaking/mudworld/MudworldMap";
import Fire from "@/models/items/Fire";
import Water from "@/models/items/Water";
import Mudman from "@/models/Mudman";

export interface MudworldBlackboardData {
  timestamp: number;
  map: MudworldMap;
  items: ItemDatabase;
  mudmen: Mudman[];
  dayLength: number;
}

export default class MudworldBlackboard extends Blackboard<MudworldBlackboardData> {
  constructor(data: MudworldBlackboardData) {
    super(data);
  }

  // Value between 0 (inclusive) and 1 (exclusive); percent of the day that has
  // elapsed. 0 and 1 are midnight, 0.5 is noon.
  get dayElapsed(): number {
    const { timestamp, dayLength } = this.data;
    // return (timestamp % dayLength) / dayLength;
    return ((timestamp + 0.25 * dayLength) % dayLength) / dayLength;
    // return ((timestamp + (0.5 * dayLength)) % dayLength) / dayLength;
  }

  get isDawn(): boolean {
    const { dayElapsed } = this;
    return 0.2 <= dayElapsed && dayElapsed <= 0.3;
  }

  get isDay(): boolean {
    const { dayElapsed } = this;
    return 0.25 <= dayElapsed && dayElapsed <= 0.75;
  }

  get isDusk(): boolean {
    const { dayElapsed } = this;
    return 0.7 <= dayElapsed && dayElapsed <= 0.8;
  }

  get isNight(): boolean {
    return !this.isDay;
  }

  // Value between 0 and 1; percent sunlight. 0 for most of the night, 1 for
  // most of the day, and in between during the transitions.
  get daylight(): number {
    if (this.isDawn) return (this.dayElapsed - 0.2) / 0.1;
    if (this.isDusk) return 1 - ((this.dayElapsed - 0.7) / 0.1);
    return this.isDay ? 1 : 0;
  }
}

export const mudworldItems = new ItemDatabase();
export const mudworldMap = new MudworldMap(512, 512, 32);
// export const mudworldMap = new MudworldMap(512, 512, 2);
// export const mudworldMap = new MudworldMap(512, 512, 1);

mudworldMap.fillWithTerrain();

// const WATERS = 500;
const WATERS = 1000;

for (let i = 0; i < WATERS; i++) {
  const coords = mudworldMap.randomWalkableCoords();
  mudworldItems.add(new Water(100, coords[0], coords[1]));
}

const FIRES = 1000;

for (let i = 0; i < FIRES; i++) {
  const coords = mudworldMap.randomWalkableCoords();
  mudworldItems.add(new Fire(coords[0], coords[1]));
}
mudworldItems.add(new Fire(300, 210));

// mudworldItems.add(new Water(100, 325, 300));
// mudworldItems.add(new Water(100, 535, 300));

export const mudworld = new MudworldBlackboard({
  timestamp: 0,
  map: mudworldMap,
  items: mudworldItems,
  mudmen: [],
  // dayLength: 12000,
  dayLength: 24000,
  // dayLength: 48000,
});
