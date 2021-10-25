import Grid from "@/mapmaking/base/Grid";
import MudworldMap from "@/mapmaking/mudworld/MudworldMap";
import { coords, distanceBetween } from "@/utilities/geo";

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

// const findAndRemoveLowestCost = (nodes: PathNode[]): PathNode | undefined => {
//   if (nodes.length === 0) return;

//   if (nodes.length === 1) return nodes[0];

//   let i = 0;
//   let lowest = nodes[0];
//   for (i = 1; i < nodes.length; i++) {
//     const current = nodes[i];
//     if (current.cost < lowest.cost) lowest = current;
//   }

//   nodes.splice(i, 1);

//   return lowest;
// };

// const forEachNeighborOf = (
//   grid: Grid,
//   x: number,
//   y: number,
//   // NOTE: distance will be 1 for cardinal directions and 1.414 (estimate of
//   //       Math.sqrt(2) to avoid the calculation) for diagonals.
//   mapper: (x: number, y: number, distance: number) => void,
//   blocked: (value: number) => boolean,
// ): void => {
//   let ny: number;
//   let nx: number;
//   let value: number;

//   // === TOP ROW ===
//   ny = y - 1;

//   // top left
//   nx = x - 1;
//   value = grid.valueAt(ny, nx)
//   if ((value ?? false) && !blocked(value)) mapper(nx, ny, 1.414);

//   // top
//   nx = x;
//   value = grid.valueAt(ny, nx)
//   if ((value ?? false) && !blocked(value)) mapper(nx, ny, 1);

//   // top right
//   nx = x + 1;
//   value = grid.valueAt(ny, nx)
//   if ((value ?? false) && !blocked(value)) mapper(nx, ny, 1.414);

//   // === LEFT AND RIGHT SIDES ===
//   ny = y;

//   // left
//   nx = x - 1;
//   value = grid.valueAt(ny, nx)
//   if ((value ?? false) && !blocked(value)) mapper(nx, ny, 1);

//   // right
//   nx = x + 1;
//   value = grid.valueAt(ny, nx)
//   if ((value ?? false) && !blocked(value)) mapper(nx, ny, 1);

//   // === BOTTOM ROW ===
//   ny = y + 1;

//   // bottom left
//   nx = x - 1;
//   value = grid.valueAt(ny, nx)
//   if ((value ?? false) && !blocked(value)) mapper(nx, ny, 1.414);

//   // bottom
//   nx = x;
//   value = grid.valueAt(ny, nx)
//   if ((value ?? false) && !blocked(value)) mapper(nx, ny, 1);

//   // bottom right
//   nx = x + 1;
//   value = grid.valueAt(ny, nx)
//   if ((value ?? false) && !blocked(value)) mapper(nx, ny, 1.414);
// }

// const unchainNodeIntoList = (node: PathNode, list: PathNode[]): PathNode[] => {
//   list.push(node);
//   return node.parent ? unchainNodeIntoList(node.parent, list) : list;
// }

// // Fills `path` variable with a list of path nodes leading to the destination
// const aStar = (grid: Grid, path: PathNode[], startX: number, startY: number, destX: number, destY: number): void => {
//   const totalDistance = distanceBetween(startX, startY, destX, destY);
//   const nodesToWalk: PathNode[] = [new PathNode(startX, startY, 0, totalDistance, null)];
//   const walkedNodes: PathNode[] = [];

//   let current: PathNode;

//   while (nodesToWalk.length) {
//     current = findAndRemoveLowestCost(nodesToWalk)!;

//     if (current.x === destX && current.y === destY) {
//       unchainNodeIntoList(current, path);
//       return;
//     }

//     walkedNodes.push(current); // should this go after the neighbor iteration?

//     forEachNeighborOf(grid, current.x, current.y, (x, y, distanceToTravel) => {
//       const distanceTraveled = current.distanceTraveled + distanceToTravel;
//       const walkedNode = walkedNodes.find((walked) => walked.x === x && walked.y === y);

//       if (!walkedNode) {
//         const distanceToEnd = distanceBetween(startX, startY, x, y);
//         nodesToWalk.push(new PathNode(x, y, distanceTraveled, distanceToEnd, current));
//       } else if (distanceTraveled < walkedNode.distanceTraveled) {
//         walkedNode.parent = current;
//         walkedNode.distanceTraveled = distanceTraveled;
//         walkedNode.cost = distanceTraveled + walkedNode.distanceToEnd;
//       }
//     }, value => !MudworldMap.walkableFromTileValue(value));
//   }
// }

// export default aStar;

export default class PathFinder {
  private readonly nodesToWalk: PathNode[] = [];
  private readonly walkedNodes: PathNode[] = [];

  constructor(
    private grid: Grid,
    // value => !MudworldMap.walkableFromTileValue(value)
    private cellBlocked: (x: number, y: number) => boolean,
  ) {}

  reset(): void {
    this.nodesToWalk.length = 0;
    this.walkedNodes.length = 0;
  }

  // NOTE: populates in reverse (end of list is start, beginning of list is dest)
  populatePath(
    path: PathNode[],
    startX: number,
    startY: number,
    destX: number,
    destY: number,
    eyesight: number,
    mapper?: (pathNode: PathNode) => void,
  ): void {
    this.reset();

    const { nodesToWalk, walkedNodes } = this;
    let totalDistance = distanceBetween(startX, startY, destX, destY);

    if (totalDistance > eyesight) {
      // console.log("yeah that's pretty far", totalDistance)
      destX = Math.floor(startX + ((destX - startX) * (eyesight / totalDistance)));
      destY = Math.floor(startY + ((destY - startY) * (eyesight / totalDistance)));
      // console.log("we'll go here instead:", destX, destY)
      // console.log("which will take...", eyesight)
      totalDistance = eyesight;
    }

    if (this.cellBlocked(destX, destY)) return;

    nodesToWalk.push(new PathNode(startX, startY, 0, totalDistance, null));

    let current: PathNode;

    while (nodesToWalk.length) {
      // debugger

      current = this.popLowestCostUnwalkedNode()!;

      if (current.x === destX && current.y === destY) {
        this.unchainIntoPath(current, path, mapper);
        return;
      }

      walkedNodes.push(current); // maybe goes after the neighbor iteration?

      // if (current.x === 14 && current.y === 49) {
      //   console.log("uh");
      //   debugger;
      // }
      this.forEachNeighborOf(current.x, current.y, (x, y, distanceToTravel) => {
        if (this.cellBlocked(x, y)) return;

        // if (x === destX && y === destY) {
        //   console.log("oh here it is");
        //   debugger;
        // }

        const distanceTraveled = current.distanceTraveled + distanceToTravel;
        const walkedNode = walkedNodes.find((walked) => walked.x === x && walked.y === y);
        if (walkedNode && walkedNode.distanceTraveled >= distanceTraveled) return;
        if (walkedNode) return;

        const unwalkedNode = nodesToWalk.find((unwalked) => unwalked.x === x && unwalked.y === y);
        if (unwalkedNode) {
          unwalkedNode.parent = current;
          unwalkedNode.distanceTraveled = distanceTraveled;
          unwalkedNode.cost = distanceTraveled + unwalkedNode.distanceToEnd;
        } else {
          const distanceToEnd = distanceBetween(x, y, destX, destY);
          nodesToWalk.push(new PathNode(x, y, distanceTraveled, distanceToEnd, current));
        }

        // if (!walkedNode) {
        //   const distanceToEnd = distanceBetween(startX, startY, x, y);
        //   nodesToWalk.push(new PathNode(x, y, distanceTraveled, distanceToEnd, current));
        // } else if (distanceTraveled < walkedNode.distanceTraveled) {
        //   walkedNode.parent = current;
        //   walkedNode.distanceTraveled = distanceTraveled;
        //   walkedNode.cost = distanceTraveled + walkedNode.distanceToEnd;
        // }
      });
    }
  }

  // TODO: Might want to organize the unwalked nodes list by cost up front so we
  //       don't have to iterate over as many each time.
  private popLowestCostUnwalkedNode = (): PathNode | undefined => {
    const { nodesToWalk } = this;

    if (nodesToWalk.length === 0) return;
    if (nodesToWalk.length === 1) return nodesToWalk.pop();

    // let i = 0;
    // let lowest = nodesToWalk[0];
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
    // NOTE: distance will be 1 for cardinal directions and 1.414 (estimate of
    //       Math.sqrt(2) to avoid the calculation) for diagonals.
    mapper: (x: number, y: number, distance: number) => void,
  ): void {
    let ny: number;
    let nx: number;
    // let value: number;

    // const { cellBlocked } = this;
    // const cardinalWeight = 16; // TODO: replace with dynamic tile size
    const cardinalWeight = 1;
    const diagonalWeight = cardinalWeight * 1.4;
  
    // === TOP ROW ===
    ny = y - 1;
  
    // top left
    nx = x - 1;
    // value = grid.valueAt(Math.floor(ny / 16), Math.floor(nx / 16));
    // console.log(nx, ny, !cellBlocked(value), value);
    // if ((value ?? false) && !cellBlocked(value)) mapper(nx, ny, diagonalWeight);
    // if (!cellBlocked(nx, ny)) mapper(nx, ny, diagonalWeight);
    mapper(nx, ny, diagonalWeight);
  
    // top
    nx = x;
    // value = grid.valueAt(Math.floor(ny / 16), Math.floor(nx / 16));
    // console.log(nx, ny, !cellBlocked(value), value);
    // if ((value ?? false) && !cellBlocked(value)) mapper(nx, ny, cardinalWeight);
    // if (!cellBlocked(nx, ny)) mapper(nx, ny, cardinalWeight);
    mapper(nx, ny, cardinalWeight);
  
    // top right
    nx = x + 1;
    // value = grid.valueAt(Math.floor(ny / 16), Math.floor(nx / 16));
    // console.log(nx, ny, !cellBlocked(value), value);
    // if ((value ?? false) && !cellBlocked(value)) mapper(nx, ny, diagonalWeight);
    // if (!cellBlocked(nx, ny)) mapper(nx, ny, diagonalWeight);
    mapper(nx, ny, diagonalWeight);
  
    // === LEFT AND RIGHT SIDES ===
    ny = y;
  
    // left
    nx = x - 1;
    // value = grid.valueAt(Math.floor(ny / 16), Math.floor(nx / 16));
    // console.log(nx, ny, !cellBlocked(value), value);
    // if ((value ?? false) && !cellBlocked(value)) mapper(nx, ny, cardinalWeight);
    // if (!cellBlocked(nx, ny)) mapper(nx, ny, cardinalWeight);
    mapper(nx, ny, cardinalWeight);
  
    // right
    nx = x + 1;
    // value = grid.valueAt(Math.floor(ny / 16), Math.floor(nx / 16));
    // console.log(nx, ny, !cellBlocked(value), value);
    // if ((value ?? false) && !cellBlocked(value)) mapper(nx, ny, cardinalWeight);
    // if (!cellBlocked(nx, ny)) mapper(nx, ny, cardinalWeight);
    mapper(nx, ny, cardinalWeight);
  
    // === BOTTOM ROW ===
    ny = y + 1;
  
    // bottom left
    nx = x - 1;
    // value = grid.valueAt(Math.floor(ny / 16), Math.floor(nx / 16));
    // console.log(nx, ny, !cellBlocked(value), value);
    // if ((value ?? false) && !cellBlocked(value)) mapper(nx, ny, diagonalWeight);
    // if (!cellBlocked(nx, ny)) mapper(nx, ny, diagonalWeight);
    mapper(nx, ny, diagonalWeight);
  
    // bottom
    nx = x;
    // value = grid.valueAt(Math.floor(ny / 16), Math.floor(nx / 16));
    // console.log(nx, ny, !cellBlocked(value), value);
    // if ((value ?? false) && !cellBlocked(value)) mapper(nx, ny, cardinalWeight);
    // if (!cellBlocked(nx, ny)) mapper(nx, ny, cardinalWeight);
    mapper(nx, ny, cardinalWeight);
  
    // bottom right
    nx = x + 1;
    // value = grid.valueAt(Math.floor(ny / 16), Math.floor(nx / 16));
    // console.log(nx, ny, !cellBlocked(value), value);
    // if ((value ?? false) && !cellBlocked(value)) mapper(nx, ny, diagonalWeight);
    // if (!cellBlocked(nx, ny)) mapper(nx, ny, diagonalWeight);
    mapper(nx, ny, diagonalWeight);
  }
}
