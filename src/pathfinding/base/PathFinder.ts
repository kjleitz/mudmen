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

    const { nodesToWalk, walkedNodes } = this;
    let totalDistance = distanceBetween(startX, startY, destX, destY);

    if (totalDistance > eyesight) {
      destX = Math.floor(startX + ((destX - startX) * (eyesight / totalDistance)));
      destY = Math.floor(startY + ((destY - startY) * (eyesight / totalDistance)));
      totalDistance = eyesight;
    }

    if (this.cellBlocked(destX, destY)) return;

    nodesToWalk.push(new PathNode(startX, startY, 0, totalDistance, null));

    let current: PathNode;

    while (nodesToWalk.length) {
      current = this.popLowestCostUnwalkedNode()!;

      if (current.distanceToEnd < stepDistance) {
        const destination = new PathNode(
          destX,
          destY,
          current.distanceTraveled + current.distanceToEnd,
          0,
          current,
        );

        this.unchainIntoPath(destination, path, mapper);
        return;
      }

      if (current.distanceTraveled > (eyesight * 4)) return;

      walkedNodes.push(current);

      this.forEachNeighborOf(current.x, current.y, stepDistance, (x, y, distanceToTravel) => {
        if (this.cellBlocked(x, y)) return;

        const distanceTraveled = current.distanceTraveled + distanceToTravel;
        const walkedNode = reverseFind(walkedNodes, walked => walked.x === x && walked.y === y);
        // if (walkedNode && walkedNode.distanceTraveled >= distanceTraveled) return;
        if (walkedNode) return;

        const unwalkedNode = reverseFind(nodesToWalk, unwalked => unwalked.x === x && unwalked.y === y);
        if (unwalkedNode) {
          unwalkedNode.parent = current;
          unwalkedNode.distanceTraveled = distanceTraveled;
          unwalkedNode.cost = distanceTraveled + unwalkedNode.distanceToEnd;
        } else {
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
    const diagonalWeight = cardinalWeight * 1.4;

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
