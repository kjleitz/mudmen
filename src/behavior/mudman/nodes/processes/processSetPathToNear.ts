import BaseNode from "@/behavior/base/nodes/BaseNode";
import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import { PathNode } from "@/pathfinding/base/PathFinder";
import { coords, distanceBetween, randomPointInCircle } from "@/utilities/geo";
import { c, f } from "@/utilities/math";

export default function processSetPathToNear(behaviorNode: BaseNode, x: number, y: number, local: MudmanBlackboard, world: MudworldBlackboard): void {
  // If we're already nearby the location, then clear any path we have set and
  // succeed, because we're done!
  if (local.isNear(x, y)) {
    local.clearPath();
    behaviorNode.succeed();
    return;
  }

  // If the mudman already has a path...
  const { destination } = local;
  if (destination) {
    // ...and the destination is near the location, then we're good (we're
    // already on our way to a spot near the location).
    if (distanceBetween(destination.x, destination.y, x, y) <= local.nearbyThreshold) {
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

  // Find target coords that are _aaaaalmost_ at the location.
  const dx = x - local.x;
  const dy = y - local.y;
  const distance = Math.sqrt((dx ** 2) + (dy ** 2));
  const targetDistance = distance - local.nearbyThreshold;
  const ratio = targetDistance / distance;
  let targetX = local.x + (dx < 0 ? f(ratio * dx) : c(ratio * dx));
  let targetY = local.y + (dy < 0 ? f(ratio * dy) : c(ratio * dy));

  // Make sure we pick target coords that are actually on a walkable point.
  // If the ones we picked _aren't_ walkable, then we'll pick random points
  // around the location until we get one that _is_ walkable.
  let targetTries = 0;
  while (!world.data.map.walkableAt(targetX, targetY)) {
    if (targetTries > 25) {
      local.data.unreachable.push(coords(x, y));
      behaviorNode.fail();
      return;
    }

    targetTries += 1;
    const target = randomPointInCircle(x, y, local.data.moveSpeed, local.nearbyThreshold);
    targetX = target[0];
    targetY = target[1];
  }

  // If the target isn't within our eyesight, then, well... we'll have to
  // wander around for a bit until we find one.
  if (!local.isWithinEyesight(targetX, targetY)) {
    const { eyesight, path } = local.data;

    // Find a random path
    let pathTries = 0;
    while (!local.hasPath && pathTries < 25) {
      pathTries += 1;
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
  //   1. We are NOT YET near the location
  //   2. We DO NOT YET have a path to a target near the location
  //   3. We DO have target coordinates
  //   4. The target IS within our eyesight
  //
  // So, we want to try to get a path to our target.
  //
  world.data.map.populatePath(
    local.data.path,
    local.x,
    local.y,
    targetX,
    targetY,
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
    // local.data.unreachable.push(coords(targetX, targetY));
    //
    // We use `x` and `y` here (instead of `targetX` and `targetY`)
    // so that it's the _location_ that's skipped... not the pseudo-random
    // target _near_ the location that's skipped.
    local.data.unreachable.push(coords(x, y));
    behaviorNode.fail();
  }
}
