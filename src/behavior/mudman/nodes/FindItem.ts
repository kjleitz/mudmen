import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import { ItemType } from "@/models/Item";
import { coords } from "@/utilities/geo";

export default class FindItem extends LeafNode {
  public itemType: ItemType;

  constructor(itemType: ItemType) {
    super();
    this.itemType = itemType;
  }

  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const item = world.data.items.findClosest(this.itemType, local.x, local.y, (item) => {
      return !local.isUnreachable(item.x, item.y);
    });

    if (!item) {
      // console.log("no reachable items");
      this.fail();
      return;
    }

    if (!local.isWithinEyesight(item.x, item.y)) {
      // console.log("that's too far for me to see but I know there's shit out there");

      if (local.hasPath) {
        // console.log("I'm already going somewhere anyway");
        this.succeed();
        return;
      }

      const { eyesight, path } = local.data;
      let tries = 0;
      while (!local.hasPath && tries < 25) {
        tries += 1;
        // "random point in a circle" from this great SO answer:
        // https://stackoverflow.com/a/50746409/7469691
        const randAngle = Math.random() * (2 * Math.PI);
        const randRadius = eyesight * Math.sqrt(Math.random());
        const randX = Math.floor(local.x + (randRadius * Math.cos(randAngle)));
        const randY = Math.floor(local.y + (randRadius * Math.sin(randAngle)));
        world.data.map.populatePath(path, local.x, local.y, randX, randY, eyesight);
      }

      if (local.hasPath) {
        // console.log("got a random path");
        this.succeed();
        return;
      }

      // console.log("couldn't get a random path");
      this.fail();
      return;
    }

    if (item.x === local.x && item.y === local.y) {
      // console.log("hey I'm already there");
      // TODO: Is this the best time to clear the unreachable list?
      // if (local.data.unreachable.length) console.log("found; clearing unreachables list", local.data.unreachable.length);
      local.data.unreachable.length = 0;
      this.succeed();
      return;
    }

    const { destination } = local;
    if (destination && destination.x === item.x && destination.y === item.y) {
      // console.log("I'm already going there");
      this.succeed();
      return;
    }

    world.data.map.populatePath(
      local.data.path,
      local.x,
      local.y,
      item.x,
      item.y,
      local.data.eyesight,
    );

    if (local.hasPath) {
      // console.log("all right, found a path");
      this.succeed();
    } else {
      // console.log("unreachable; pushing", item.x, item.y);
      // TODO: The unreachable list will grow to eventually contain all the
      //       item positions. Memory leak potential. Maybe as a mitigating
      //       measure the list should actually reference the item (as an
      //       implementation of the `Position` interface) so that the list
      //       can still grow to a large size but not create _new_ Coords
      //       (Int16Array) objects for every set of (x,y) positions? Instead it
      //       would only reference existing objects. Just a thought.
      local.data.unreachable.push(coords(item.x, item.y));
      this.fail();
    }
  }
}
