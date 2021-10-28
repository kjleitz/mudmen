import { reverseFind } from "@/utilities/collections";
import { distanceBetween } from "@/utilities/geo";

export class PathNode {
  public cost: number;

  constructor(
    public x: number,
    public y: number,
    public distanceTraveled: number,
    public distanceToEnd: number,
    public parent: PathNode | null,
  ) {
    this.cost = distanceTraveled + distanceToEnd;
  }
}

export default class PathFinder {
  private readonly nodesToWalk: PathNode[] = [];
  private readonly walkedNodes: PathNode[] = [];

  constructor(
    private cellBlocked: (x: number, y: number) => boolean,
  ) {}

  reset(): void {
    this.nodesToWalk.length = 0;
    this.walkedNodes.length = 0;
  }

  // NOTE: Populates path array in reverse (end of the list is the start of the
  // path, beginning of the list is the destination).
  //
  // NB: Something weird happening? See if any coordinates in your system/calcs
  //     are non-integer values.
  //
  populatePath(
    path: PathNode[],
    startX: number,
    startY: number,
    destX: number,
    destY: number,
    eyesight: number,
    stepDistance: number,
    mapper?: (pathNode: PathNode) => void,
  ): void {
    this.reset();
    startX = Math.floor(startX);
    startY = Math.floor(startY);
    destX = Math.floor(destX);
    destY = Math.floor(destY);
    stepDistance = Math.floor(stepDistance);
    // console.log("RESET");

    const { nodesToWalk, walkedNodes } = this;
    let totalDistance = distanceBetween(startX, startY, destX, destY);
    // console.log(totalDistance);

    if (totalDistance > eyesight) {
      destX = Math.floor(startX + ((destX - startX) * (eyesight / totalDistance)));
      destY = Math.floor(startY + ((destY - startY) * (eyesight / totalDistance)));
      totalDistance = eyesight;
    }
    // console.log(2);

    if (this.cellBlocked(destX, destY)) return;
    // console.log(3);

    nodesToWalk.push(new PathNode(startX, startY, 0, totalDistance, null));

    let current: PathNode;

    while (nodesToWalk.length) {
      current = this.popLowestCostUnwalkedNode()!;
      // console.log(4, nodesToWalk.length);

      if (current.distanceToEnd <= stepDistance) {
        const destination = new PathNode(
          destX,
          destY,
          current.distanceTraveled + current.distanceToEnd,
          0,
          current,
        );

        // console.log(5);
        this.unchainIntoPath(destination, path, mapper);
        return;
      }

      // console.log(6);
      if (current.distanceTraveled > (eyesight * 4)) return;
      // console.log(7);

      walkedNodes.push(current);

      this.forEachNeighborOf(current.x, current.y, stepDistance, (x, y, distanceToTravel) => {
        // console.log(8);
        if (this.cellBlocked(x, y)) return;
        // console.log(9);

        const distanceTraveled = current.distanceTraveled + distanceToTravel;
        const walkedNode = reverseFind(walkedNodes, walked => walked.x === x && walked.y === y);
        // console.log(10);
        // if (walkedNode && walkedNode.distanceTraveled >= distanceTraveled) return;
        if (walkedNode) return;

        // console.log(11);
        const unwalkedNode = reverseFind(nodesToWalk, unwalked => unwalked.x === x && unwalked.y === y);
        // console.log(12);
        if (unwalkedNode) {
          // console.log(13);
          unwalkedNode.parent = current;
          unwalkedNode.distanceTraveled = distanceTraveled;
          unwalkedNode.cost = distanceTraveled + unwalkedNode.distanceToEnd;
        } else {
          // console.log(14);
          const distanceToEnd = distanceBetween(x, y, destX, destY);
          nodesToWalk.push(new PathNode(x, y, distanceTraveled, distanceToEnd, current));
        }
      });
    }
  }

  // TODO: Might want to organize the unwalked nodes list by cost up front so we
  //       don't have to iterate over as many each time.
  private popLowestCostUnwalkedNode(): PathNode | undefined {
    const { nodesToWalk } = this;

    if (nodesToWalk.length === 0) return;
    if (nodesToWalk.length === 1) return nodesToWalk.pop();

    let lowestIndex = 0;
    let lowest = nodesToWalk[lowestIndex];
    for (let i = 1; i < nodesToWalk.length; i++) {
      const current = nodesToWalk[i];
      if (current.cost < lowest.cost) {
        lowestIndex = i;
        lowest = current;
      }
    }

    nodesToWalk.splice(lowestIndex, 1);
    return lowest;
  }

  private unchainIntoPath(node: PathNode, path: PathNode[], mapper?: (pathNode: PathNode) => void): void {
    path.push(node);
    if (mapper) mapper(node);
    if (node.parent) this.unchainIntoPath(node.parent, path, mapper);
  }

  private forEachNeighborOf(
    x: number,
    y: number,
    stepDistance: number,
    // NOTE: distance will be 1 for cardinal directions and 1.414 (estimate of
    //       Math.sqrt(2) to avoid the calculation) for diagonals.
    mapper: (x: number, y: number, distance: number) => void,
  ): void {
    let ny: number;
    let nx: number;

    // const cardinalWeight = 16; // TODO: replace with dynamic tile size
    // const cardinalWeight = 1;
    const cardinalWeight = stepDistance;
    // const diagonalWeight = cardinalWeight * 1.4;
    const diagonalWeight = cardinalWeight * 1.4142135623730951;

    // === TOP ROW ===
    ny = y - stepDistance;

    // top left
    nx = x - stepDistance;
    mapper(nx, ny, diagonalWeight);

    // top
    nx = x;
    mapper(nx, ny, cardinalWeight);

    // top right
    nx = x + stepDistance;
    mapper(nx, ny, diagonalWeight);

    // === LEFT AND RIGHT SIDES ===
    ny = y;

    // left
    nx = x - stepDistance;
    mapper(nx, ny, cardinalWeight);

    // right
    nx = x + stepDistance;
    mapper(nx, ny, cardinalWeight);

    // === BOTTOM ROW ===
    ny = y + stepDistance;

    // bottom left
    nx = x - stepDistance;
    mapper(nx, ny, diagonalWeight);

    // bottom
    nx = x;
    mapper(nx, ny, cardinalWeight);

    // bottom right
    nx = x + stepDistance;
    mapper(nx, ny, diagonalWeight);
  }
}
