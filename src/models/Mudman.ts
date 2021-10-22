import BehaviorTree from "@/behavior/base/BehaviorTree";
import BaseNode from "@/behavior/base/nodes/BaseNode";
import All from "@/behavior/base/nodes/composites/All";
import Repeat from "@/behavior/base/nodes/decorators/Repeat";
import Log from "@/behavior/base/nodes/leaves/Log";
import MudmanBlackboard, { MudmanData } from "@/behavior/mudman/data/MudmanBlackboard";
import { mudworld } from "@/behavior/mudman/data/MudworldBlackboard";
import MoveToTarget from "@/behavior/mudman/nodes/MoveToTarget";
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
  private behaviorTree: BehaviorTree;
  private local: MudmanBlackboard;

  constructor() {
    const behavior = new MudmanBehavior();
    this.local = new MudmanBlackboard();
    this.behaviorTree = new BehaviorTree(behavior, this.local, mudworld);
  }

  tick(): void {
    this.behaviorTree.tick();
  }
}
