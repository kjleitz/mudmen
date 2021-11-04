import BaseNode from "@/behavior/base/nodes/BaseNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import { PathNode } from "@/pathfinding/base/PathFinder";
import { coords, randomPointInCircle } from "@/utilities/geo";

export default function processSetPathTo(behaviorNode: BaseNode, x: number, y: number, local: MudmanBlackboard, world: MudworldBlackboard): void {
  // If we're already at the location, then clear any path we have set and
  // succeed, because we're done!
  if (local.isAt(x, y)) {
    local.clearPath();
    behaviorNode.succeed();
    return;
  }

  // If the mudman already has a path...
  const { destination } = local;
  if (destination) {
    // ...and the destination IS the location, then we're good (we're already
    // on our way to the location).
    if (destination.x === x && destination.y === y) {
      behaviorNode.succeed();
      return;
    }

    // If the location is out of sight and we still have a destination, then we
    // should probably just follow that path. It's likely from a previous
    // iteration where we had to do a random walk. And if not, then it's
    // better than having to do a random walk, anyway.
    if (!local.isWithinEyesight(x, y)) {
      behaviorNode.succeed();
      return;
    }

    // If it _is_ within eyesight, though, we should get rid of our current
    // path and destination, and instead forge a new path toward the location.
    local.clearPath();
  }

  // If we're SUPER CLOSE to the location, just make a simple path to it and
  // succeed.
  if (local.isOneStepAwayFrom(x, y)) {
    const destinationNode = new PathNode(x, y, local.distanceTo(x, y), 0, null);
    local.data.path.push(destinationNode);
    behaviorNode.succeed();
    return;
  }

  // If the location isn't within our eyesight, then, well... we'll have to
  // wander around for a bit until we find one.
  if (!local.isWithinEyesight(x, y)) {
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
      behaviorNode.succeed();
      return;
    }

    // Couldn't find a walkable random path... that's weird, but oh well.
    // We'll just give up.
    behaviorNode.fail();
    return;
  }

  // Okay, we now know the following:
  //
  //   1. We are NOT YET at the location
  //   2. We are NOT YET near enough to the location to be one step away
  //   3. We DO NOT YET have a path to the location
  //   4. The target IS within our eyesight
  //
  // So, we want to try to get a path to the location.
  //
  world.data.map.populatePath(
    local.data.path,
    local.x,
    local.y,
    x,
    y,
    local.data.eyesight,
  );

  // If we have a path to the target after populating, then we're good! If
  // not, we'll want to remember that that target was unreachable and fail so
  // we can try a different one.
  if (local.hasPath) {
    behaviorNode.succeed();
  } else {
    // TODO: The unreachable list will grow to eventually contain all the
    //       location positions. Memory leak potential. Maybe as a mitigating
    //       measure the list should actually reference the location (as an
    //       implementation of the `Position` interface) so that the list
    //       can still grow to a large size but not create _new_ Coords
    //       (Int16Array) objects for every set of (x,y) positions? Instead it
    //       would only reference existing objects. Just a thought.
    //
    local.data.unreachable.push(coords(x, y));
    behaviorNode.fail();
  }
}
