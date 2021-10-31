import LeafNode from "@/behavior/base/nodes/LeafNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import { ItemType } from "@/models/Item";
import { PathNode } from "@/pathfinding/base/PathFinder";
import { coords, randomPointInCircle } from "@/utilities/geo";

export default class SetPathToItem extends LeafNode {
  constructor(public itemType: ItemType) {
    super();
  }

  process(local: MudmanBlackboard, world: MudworldBlackboard): void {
    const item = world.data.items.findClosest(this.itemType, local.x, local.y, (item) => {
      return !local.isUnreachable(item.x, item.y);
    });

    // If there's no item that exists by the given type, we can't set a path.
    if (!item) {
      this.fail();
      return;
    }

    // If we're already at the item, then clear any path we have set and
    // succeed, because we're done!
    if (local.isAt(item.x, item.y)) {
      local.clearPath();
      this.succeed();
      return;
    }

    // If the mudman already has a path...
    const { destination } = local;
    if (destination) {
      // ...and the destination IS the item, then we're good (we're already
      // on our way to the item).
      if (destination.x === item.x && destination.y === item.y) {
        this.succeed();
        return;
      }

      // If the item is out of sight and we still have a destination, then we
      // should probably just follow that path. It's likely from a previous
      // iteration where we had to do a random walk. And if not, then it's
      // better than having to do a random walk, anyway.
      if (!local.isWithinEyesight(item.x, item.y)) {
        this.succeed();
        return;
      }

      // If it _is_ within eyesight, though, we should get rid of our current
      // path and destination, and instead forge a new path toward the item.
      local.clearPath();
    }

    // If we're SUPER CLOSE to the item, just make a simple path to it and
    // succeed.
    if (local.isOneStepAwayFrom(item.x, item.y)) {
      const destinationNode = new PathNode(item.x, item.y, local.distanceTo(item.x, item.y), 0, null);
      local.data.path.push(destinationNode);
      this.succeed();
      return;
    }

    // If the item isn't within our eyesight, then, well... we'll have to wander
    // around for a bit until we find one.
    if (!local.isWithinEyesight(item.x, item.y)) {
      const { eyesight, path } = local.data;

      // Find a random path
      let tries = 0;
      while (!local.hasPath && tries < 25) {
        tries += 1;
        const point = randomPointInCircle(local.x, local.y, eyesight);
        world.data.map.populatePath(path, local.x, local.y, point[0], point[1], eyesight);
      }

      // Found a random path
      if (local.hasPath) {
        this.succeed();
        return;
      }

      // Couldn't find a walkable random path... that's weird, but oh well.
      // We'll just give up.
      this.fail();
      return;
    }

    // Okay, we now know the following:
    //
    //   1. There IS a "closest item"
    //   2. We are NOT YET at the item
    //   3. We are NOT YET near enough to the item to be one step away
    //   4. We DO NOT YET have a path to the item
    //   5. The target IS within our eyesight
    //
    // So, we want to try to get a path to the item.
    //
    world.data.map.populatePath(
      local.data.path,
      local.x,
      local.y,
      item.x,
      item.y,
      local.data.eyesight,
    );

    // If we have a path to the target after populating, then we're good! If
    // not, we'll want to remember that that target was unreachable and fail so
    // we can try a different one.
    if (local.hasPath) {
      this.succeed();
    } else {
      // TODO: The unreachable list will grow to eventually contain all the
      //       item positions. Memory leak potential. Maybe as a mitigating
      //       measure the list should actually reference the item (as an
      //       implementation of the `Position` interface) so that the list
      //       can still grow to a large size but not create _new_ Coords
      //       (Int16Array) objects for every set of (x,y) positions? Instead it
      //       would only reference existing objects. Just a thought.
      //
      local.data.unreachable.push(coords(item.x, item.y));
      this.fail();
    }
  }
}
