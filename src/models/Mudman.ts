import BehaviorTree from "@/behavior/base/BehaviorTree";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import { mudworld } from "@/behavior/mudman/data/MudworldBlackboard";
import MudmanBehavior from "@/behavior/mudman/nodes/MudmanBehavior";

export interface MudmanOptions {
  id: string,
  name: string,
  gender: number,
  nature: {
    strength: number,
    intelligence: number,
    wisdom: number,
    dexterity: number,
    constitution: number,
    charisma: number,
  },
  nurture: {
    experience: number, // generic leveling
    age: number, // lived
    muscles: number, // grown
    education: number, // learned
    endurance: number, // core practice
    coordination: number, // hand-eye (trained)
    sociability: number, // social aptitude; friendly, politic, influential, etc.
    empathy: number, // good <=> evil
    duty: number, // lawful <=> chaotic
  }
}

export default class Mudman {
  public local: MudmanBlackboard;

  private behaviorTree: BehaviorTree;

  constructor(x?: number, y?: number) {
    const behavior = new MudmanBehavior();
    const data = MudmanBlackboard.defaults;
    if (x || x === 0) data.currentX = x;
    if (y || y === 0) data.currentY = y;
    this.local = new MudmanBlackboard(data);
    this.behaviorTree = new BehaviorTree(behavior, this.local, mudworld);
  }

  tick(): void {
    this.behaviorTree.tick();
    this.local.dehydrate(100);
  }
}
