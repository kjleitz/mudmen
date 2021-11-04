import Blackboard from "@/behavior/base/data/Blackboard";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import ItemDatabase from "@/mapmaking/mudworld/ItemDatabase";
import MudworldMap from "@/mapmaking/mudworld/MudworldMap";
import Fire from "@/models/items/Fire";
import Water from "@/models/items/Water";
import Mudman from "@/models/Mudman";
import { distanceBetween } from "@/utilities/geo";
import { f } from "@/utilities/math";

export interface MudworldBlackboardData {
  timestamp: number;
  map: MudworldMap;
  items: ItemDatabase;
  mudmen: Mudman[];
  dayLength: number;
  dayOffset: number;
}

export default class MudworldBlackboard extends Blackboard<MudworldBlackboardData> {
  constructor(data: MudworldBlackboardData) {
    super(data);
  }

  static isDawn(dayElapsed: number): boolean {
    return 0.2 <= dayElapsed && dayElapsed <= 0.3;
  }

  static isDay(dayElapsed: number): boolean {
    return 0.25 <= dayElapsed && dayElapsed <= 0.75;
  }

  static isDusk(dayElapsed: number): boolean {
    return 0.7 <= dayElapsed && dayElapsed <= 0.8;
  }

  static isNight(dayElapsed: number): boolean {
    return !MudworldBlackboard.isDay(dayElapsed);
  }

  // Value between 0 (inclusive) and 1 (exclusive); percent of the day that has
  // elapsed. 0 and 1 are midnight, 0.5 is noon.
  get dayElapsed(): number {
    const { timestamp, dayLength, dayOffset } = this.data;
    // return ((timestamp + 0.25 * dayLength) % dayLength) / dayLength;
    return ((timestamp + dayOffset) % dayLength) / dayLength;
  }

  get isDawn(): boolean { return MudworldBlackboard.isDawn(this.dayElapsed) }
  get isDay(): boolean { return MudworldBlackboard.isDay(this.dayElapsed) }
  get isDusk(): boolean { return MudworldBlackboard.isDusk(this.dayElapsed) }
  get isNight(): boolean { return MudworldBlackboard.isNight(this.dayElapsed) }

  // Value between 0 and 1; percent sunlight. 0 for most of the night, 1 for
  // most of the day, and in between during the transitions.
  get daylight(): number {
    if (this.isDawn) return (this.dayElapsed - 0.2) / 0.1;
    if (this.isDusk) return 1 - ((this.dayElapsed - 0.7) / 0.1);
    return this.isDay ? 1 : 0;
  }

  rotateWorld(percentOfDay: number): void {
    this.data.dayOffset += f(percentOfDay * this.data.dayLength);
  }

  letItBeDay(): void {
    if (this.isDawn) return;

    if (this.isDay) {
      // set to the beginning of day
      this.setTimeOfDay(0.25);
    } else {
      // set to the beginning of dawn
      this.setTimeOfDay(0.2);
    }
  }

  letItBeNight(): void {
    if (this.isDusk) return;

    if (this.isNight) {
      // set to the beginning of night
      this.setTimeOfDay(0.75);
    } else {
      // set to the beginning of dusk
      this.setTimeOfDay(0.7);
    }
  }

  setTimeOfDay(percentOfDay: number): void {
    const { timestamp, dayLength, dayOffset } = this.data;
    const targetDayMs = f(percentOfDay * dayLength);
    const currentDayMs = (timestamp + dayOffset) % dayLength;
    this.data.dayOffset += (targetDayMs - currentDayMs);
  }

  findClosestMudman(x: number, y: number, filter?: (mudman: Mudman) => boolean): Mudman | undefined {
    const { mudmen } = this.data;
    const population = mudmen.length;
    if (population === 0) return;
    if (population === 1) {
      const mudman = mudmen[0];
      return (!filter || filter(mudman)) ? mudman : undefined;
    }

    let closestMudman: Mudman | undefined = undefined;
    // let closestDistance = distanceBetween(x, y, closestMudman.local.x, closestMudman.local.y);
    let closestDistance: number | undefined = undefined;

    for (let i = 0; i < population; i++) {
      const mudman = mudmen[i];

      if (!filter || filter(mudman)) {
        if (mudman.local.x === x && mudman.local.y === y) return mudman;

        const distance = distanceBetween(x, y, mudman.local.x, mudman.local.y);
        if (!closestDistance || distance < closestDistance) {
          closestMudman = mudman;
          closestDistance = distance;
        }
      }
    }

    return closestMudman;
  }

  findClosestFellowMudman(local: MudmanBlackboard): Mudman | undefined {
    return this.findClosestMudman(local.x, local.y, (mudman) => {
      const result = mudman.local !== local;
      // if (result) console.log("there I am");
      // if (local === (window as any).renderer.hero.local && !result) console.log("there I am");
      return result;
    });
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
  dayOffset: 6000,
});
