import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";

export default class IsTalking extends LeafNode {
  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const { talkingTo } = local.data;

    if (talkingTo && local.isNear(talkingTo.local.x, talkingTo.local.y)) {
      if (local === (window as any).renderer.hero.local) console.log("talking to this dude")
      this.succeed();
    } else {
      if (local === (window as any).renderer.hero.local) console.log("not talking to this dude")
      local.data.talkingTo = null;
      this.fail();
    }
  }
}
