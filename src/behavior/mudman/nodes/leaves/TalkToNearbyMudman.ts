import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import { ItemType } from "@/models/Item";
import Mudman from "@/models/Mudman";

export default class TalkToNearbyMudman extends LeafNode {
  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const mudman = world.findClosestFellowMudman(local);

    if (local === (window as any).renderer.hero.local) console.log("that's me:", mudman?.local === (window as any).renderer.hero.local)
    if (!mudman || !local.isNear(mudman.local.x, mudman.local.y)) {
      this.fail();
      return;
    }

    const { talkingTo } = mudman.local.data;
    if (talkingTo) {
      // if the mudman is talking to me, talk to him... otherwise, talk to
      // whomever he is talking to.
      if (local === talkingTo.local) {
        local.data.talkingTo = mudman;
      } else {
        local.data.talkingTo = talkingTo;
      }
    } else {
      // if the mudman is not talking to anyone, talk to him.
      local.data.talkingTo = mudman;
    }

    const { x, y } = local.data.talkingTo.local;
    local.face(x, y);
    this.succeed();
  }
}
