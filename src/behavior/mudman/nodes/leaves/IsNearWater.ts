import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";

export default class IsNearWater extends LeafNode {
  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const { map } = world.data;
    // const row = map.yToRow(local.y);
    // const col = map.xToCol(local.x);

    if (map.underwaterAt(local.x, local.y)) {
      this.succeed();
      return;
    }

    if (map.underwaterAt(local.x - local.nearbyThreshold, local.y - local.nearbyThreshold)) {
      // ...
    }

    // if (map.underwaterAt(local.x - map.tileSize, local.y)) {
    //   this.succeed();
    //   return;
    // }


  }
}
