import Grid from "@/mapmaking/base/Grid";
import elevationNoise from "@/mapmaking/mudworld/generators/elevationNoise";
import floraNoise, { TREE_LINE } from "@/mapmaking/mudworld/generators/floraNoise";
import moistureNoise from "@/mapmaking/mudworld/generators/moistureNoise";
import { SNOW_LINE } from "@/mapmaking/mudworld/generators/snowiness";
import PathFinder, { PathNode } from "@/pathfinding/base/PathFinder";
import { coords, Coords, distanceBetween } from "@/utilities/geo";
import { f, rand } from "@/utilities/math";

// const TILE_WIDTH = 16;

export const enum Structure {
  NONE,
  TREE,
}

export function to32Bits(value: number, place: number, bits: number) {
  return value << (31 - bits - place);
}

export function from32Bits(value: number, place: number, bits: number) {
  // return value >> (31 - bits - place);
  const offset = 31 - place;
  // there's no way this is the simplest way to do this
  return (value % (2 ** offset) >> (offset - bits));
}

export interface MudworldMapper<R = void> {
  (
    row: number,
    col: number,
    elevation: number,
    moisture: number,
    structure: number,
    underwater: boolean,
  ): R;
}

export default class MudworldMap {
  public grid: Grid<Uint32Array>;
  public pathFinder: PathFinder;
  public tileSize: number;

  constructor(rowCount: number, colCount: number, tileSize: number) {
    this.tileSize = tileSize;
    this.grid = new Grid(rowCount, colCount, Uint32Array);
    this.pathFinder = new PathFinder((x, y) => !this.walkableAt(x, y));
  }

  static fillWithTerrain(grid: Grid): void {
    grid.fill((row, col, _val) => {
      const x = col / grid.colCount;
      const y = row / grid.rowCount;

      // `elevation` will be a value between 0 and 255, where 128 is sea level
      const elevation = this.noiseToByte(elevationNoise(x, y));
      const underwater = elevation < 128;

      // 255 - 64 = 191, so once you get within 64 of the ceiling it gets drier
      // and drier...
      const dryness = f(255 * (Math.max(elevation - 191, 0) / 64));
      // jesus christ
      const wetness = 0.8 * 255 * ((128 - Math.abs(elevation - 128)) / 128);

      const moisture = Math.max(wetness, this.noiseToByte(moistureNoise(x, y)) - dryness);

      const florality = floraNoise(x, y); // florality could be anywhere from -1 to 1
      const distanceToSeaLevel = elevation - 128;
      const structure = florality > 0.25 && elevation < TREE_LINE && distanceToSeaLevel > 2
        ? Structure.TREE
        : Structure.NONE;

      return this.tileValue(
        elevation,
        moisture,
        structure,
        underwater,
      );
    });
  }

  static eachTile(grid: Grid, mapper: MudworldMapper<void>): void {
    grid.each((row, col, val) => {
      mapper(
        row,
        col,
        this.elevationFromTileValue(val),
        this.moistureFromTileValue(val),
        this.structureFromTileValue(val),
        this.underwaterFromTileValue(val),
      );
    });
  }

  static feedMapper<T>(grid: Grid, row: number, col: number, mapper: MudworldMapper<T>): T {
    const value = grid.valueAt(row, col);
    return mapper(
      row,
      col,
      this.elevationFromTileValue(value),
      this.moistureFromTileValue(value),
      this.structureFromTileValue(value),
      this.underwaterFromTileValue(value),
    );
  }

  static eachNeighboringTile(grid: Grid, row: number, col: number, mapper: MudworldMapper<void>): void {
    let nRow: number;
    let nCol: number;

    // === TOP ROW ===
    nRow = row - 1;

    // top left
    nCol = col - 1;
    MudworldMap.feedMapper(grid, nRow, nCol, mapper);

    // top
    nCol = col;
    MudworldMap.feedMapper(grid, nRow, nCol, mapper);

    // top right
    nCol = col + 1;
    MudworldMap.feedMapper(grid, nRow, nCol, mapper);

    // === LEFT AND RIGHT SIDES ===
    nRow = row;

    // left
    nCol = col - 1;
    MudworldMap.feedMapper(grid, nRow, nCol, mapper);

    // right
    nCol = col + 1;
    MudworldMap.feedMapper(grid, nRow, nCol, mapper);

    // === BOTTOM ROW ===
    nRow = row + 1;

    // bottom left
    nCol = col - 1;
    MudworldMap.feedMapper(grid, nRow, nCol, mapper);

    // bottom
    nCol = col;
    MudworldMap.feedMapper(grid, nRow, nCol, mapper);

    // bottom right
    nCol = col + 1;
    MudworldMap.feedMapper(grid, nRow, nCol, mapper);
  }

  // Where `noiseModifier` is a value between -1 and 1 (exclusive), returns a
  // value between 0 and 255.
  static noiseToByte(noiseModifier: number): number {
    return f((noiseModifier + 1) * 128);
  }

  static tileValue(
    elevation: number, // 8 bits (1 byte; 0-255)
    moisture: number, // 8 bits (1 byte; 0-255)
    structure: number, // 8 bits (1 byte; 0-255)
    underwater: boolean, // 1 bit (true or false)
    // unknown2: boolean, // 1 bit (true or false)
    // unknown3: boolean, // 1 bit (true or false)
    // unknown4: boolean, // 1 bit (true or false)
    // unknown5: boolean, // 1 bit (true or false)
    // unknown6: boolean, // 1 bit (true or false)
    // unknown7: boolean, // 1 bit (true or false)
    // unknown8: boolean, // 1 bit (true or false)
  ): number {
    return to32Bits(elevation, 0, 8)
      | to32Bits(moisture, 8, 8)
      | to32Bits(structure, 16, 8)
      | to32Bits(underwater ? 1 : 0, 24, 1);
    // | to32Bits(unknown2 ? 1 : 0, 25, 1)
    // | to32Bits(unknown3 ? 1 : 0, 26, 1)
    // | to32Bits(unknown4 ? 1 : 0, 27, 1)
    // | to32Bits(unknown5 ? 1 : 0, 28, 1)
    // | to32Bits(unknown6 ? 1 : 0, 29, 1)
    // | to32Bits(unknown7 ? 1 : 0, 30, 1)
    // | to32Bits(unknown8 ? 1 : 0, 31, 1);
  }

  static elevationFromTileValue(tileValue: number): number {
    return from32Bits(tileValue, 0, 8);
  }

  static moistureFromTileValue(tileValue: number): number {
    return from32Bits(tileValue, 8, 8);
  }

  static structureFromTileValue(tileValue: number): Structure {
    return from32Bits(tileValue, 16, 8);
  }

  static underwaterFromTileValue(tileValue: number): boolean {
    return Boolean(from32Bits(tileValue, 24, 1));
  }

  // TODO: combine these into a boolean bit so it can just be set arbitrarily
  static walkableFromTileValue(tileValue: number): boolean {
    return !this.underwaterFromTileValue(tileValue)
      && !this.structureFromTileValue(tileValue);
  }

  get rowCount(): number { return this.grid.rowCount }
  get colCount(): number { return this.grid.colCount }

  // get tileSize(): number { return TILE_WIDTH }

  get width(): number { return this.colCount * this.tileSize }
  get height(): number { return this.rowCount * this.tileSize }

  xToCol(x: number): number {
    return f(x / this.tileSize);
  }

  yToRow(y: number): number {
    return f(y / this.tileSize);
  }

  fillWithTerrain(): void {
    MudworldMap.fillWithTerrain(this.grid);
  }

  eachTile(mapper: MudworldMapper<void>): void {
    MudworldMap.eachTile(this.grid, mapper);
  }

  eachNeighboringTile(row: number, col: number, mapper: MudworldMapper<void>): void {
    MudworldMap.eachNeighboringTile(this.grid, row, col, mapper);
  }

  // NOTE: not guaranteed to be walkable
  randomCoordsOnLand(): Coords {
    const { width, height } = this;
    let x = 0;
    let y = 0;
    let elevation = -1;

    while (elevation < 129) {
      x = f(rand() * width);
      y = f(rand() * height);
      elevation = MudworldMap.elevationFromTileValue(this.valueAt(x, y));
    }

    return coords(x, y);
  }

  randomWalkableCoords(): Coords {
    const { width, height } = this;
    let x = 0;
    let y = 0;
    let walkable = false;

    while (!walkable) {
      x = f(rand() * width);
      y = f(rand() * height);
      walkable = MudworldMap.walkableFromTileValue(this.valueAt(x, y));
    }

    return coords(x, y);
  }

  // NOTE: This returns TILE coords, not world coords.
  randomWalkableTileCoords(): Coords {
    const worldCoords = this.randomWalkableCoords();
    worldCoords[0] = f(worldCoords[0] / this.tileSize);
    worldCoords[1] = f(worldCoords[1] / this.tileSize);
    return worldCoords;
  }

  // NOTE: populates in reverse (end of list is start, beginning of list is dest)
  populatePath(path: PathNode[], startX: number, startY: number, destX: number, destY: number, eyesight: number): void {
    this.pathFinder.populatePath(path, startX, startY, destX, destY, eyesight, this.tileSize);
  }

  valueAt(x: number, y: number): number {
    return this.grid.valueAt(this.yToRow(y), this.xToCol(x));
  }

  valueAtTile(row: number, col: number): number {
    return this.grid.valueAt(row, col);
  }

  inBounds(x: number, y: number): boolean {
    return 0 <= x && 0 <= y && x < this.width && y < this.height;
  }

  walkableAt(x: number, y: number): boolean {
    return this.inBounds(x, y)
      ? MudworldMap.walkableFromTileValue(this.valueAt(x, y))
      : false;
  }

  underwaterAt(x: number, y: number): boolean {
    return MudworldMap.underwaterFromTileValue(this.valueAt(x, y))
      || !this.inBounds(x, y);
  }

  tileIsTouched(tileSize: number, originX: number, originY: number, row: number, col: number, distance: number): boolean {
    const leftX = col * tileSize;
    const rightX = (col + 1) * tileSize;
    const topY = row * tileSize;
    const bottomY = (row + 1) * tileSize;

    if (leftX < originX) {
      if (topY < originY) {
        // top left quadrant
        const distanceToTopLeft = distanceBetween(originX, originY, leftX, topY);
        const distanceToBottomRight = distanceBetween(originX, originY, rightX, bottomY);
        return (distanceToTopLeft >= distance && distance >= distanceToBottomRight);
      } else {
        // bottom left quadrant
        const distanceToTopRight = distanceBetween(originX, originY, rightX, topY);
        const distanceToBottomLeft = distanceBetween(originX, originY, leftX, bottomY);
        return (distanceToBottomLeft >= distance && distance >= distanceToTopRight);
      }
    } else {
      if (topY < originY) {
        // top right quadrant
        const distanceToTopRight = distanceBetween(originX, originY, rightX, topY);
        const distanceToBottomLeft = distanceBetween(originX, originY, leftX, bottomY);
        return (distanceToBottomLeft <= distance && distance <= distanceToTopRight);
      } else {
        // bottom right quadrant
        const distanceToTopLeft = distanceBetween(originX, originY, leftX, topY);
        const distanceToBottomRight = distanceBetween(originX, originY, rightX, bottomY);
        return (distanceToTopLeft <= distance && distance <= distanceToBottomRight);
      }
    }
  }

  eachTileAtDistanceFrom(x: number, y: number, distance: number, mapper: MudworldMapper<void>): void {
    const { tileSize } = this;

    // start at far left of circle, going clockwise
    const centerCol = this.xToCol(x);
    const centerRow = this.yToRow(y);
    const startCol = this.xToCol(x - distance);
    const startRow = centerRow;

    // we'll stop when we hit our starting tile again
    let started = false;
    let col = startCol;
    let row = startRow;

    // I doubt this is the "correct" way of doing this, but I give up. To be
    // clear: this is not just a problem of graphing a circle onto a grid; it's
    // graphing a circle onto a lower-resolution grid while keeping the fidelity
    // of the resolution of the starting point, in the most efficient manner...
    // like, the center point could be anywhere in the center tile, and we want
    // to graph every tile intersected by a circle of radius `distance` from the
    // center point. We don't want to do the naive thing and loop through every
    // single tile in the grid bounded by a square circumscribing the circle,
    // because that's way too wasteful. We also don't want to just start with a
    // tile on the circle and then check all eight adjacent points in the same
    // order, either, because while that would be better than the former
    // solution it would also count unnecessary tiles. What we're doing here,
    // instead, is starting with a tile on the circle, noting the direction we
    // want to go in (tangent to the circle), and checking the three tiles
    // adjacent to that one which could possibly contain the next touched point.
    // Good enough for me. If there's a better way, I don't really give a shit.
    while (!started || col !== startCol || row !== startRow) {
      started = true;

      MudworldMap.feedMapper(this.grid, row, col, mapper);

      if (col < centerCol) {
        if (row < centerRow) {
          // top left quadrant
          if (this.tileIsTouched(tileSize, x, y, row - 1, col, distance)) {
            row -= 1;
          } else if (this.tileIsTouched(tileSize, x, y, row, col + 1, distance)) {
            col += 1;
          } else if (this.tileIsTouched(tileSize, x, y, row - 1, col + 1, distance)) {
            row -= 1;
            col += 1;
          } else {
            throw new Error("How the hell did that happen?");
          }
        } else {
          // bottom left quadrant
          if (this.tileIsTouched(tileSize, x, y, row, col - 1, distance)) {
            col -= 1;
          } else if (this.tileIsTouched(tileSize, x, y, row - 1, col, distance)) {
            row -= 1;
          } else if (this.tileIsTouched(tileSize, x, y, row - 1, col - 1, distance)) {
            row -= 1;
            col -= 1;
          } else {
            throw new Error("How the hell did that happen?");
          }
        }
      } else {
        if (row < centerRow) {
          // top right quadrant
          if (this.tileIsTouched(tileSize, x, y, row, col + 1, distance)) {
            col += 1;
          } else if (this.tileIsTouched(tileSize, x, y, row + 1, col, distance)) {
            row += 1;
          } else if (this.tileIsTouched(tileSize, x, y, row + 1, col + 1, distance)) {
            row += 1;
            col += 1;
          } else {
            throw new Error("How the hell did that happen?");
          }
        } else {
          // bottom right quadrant
          if (this.tileIsTouched(tileSize, x, y, row + 1, col, distance)) {
            row += 1;
          } else if (this.tileIsTouched(tileSize, x, y, row, col - 1, distance)) {
            col -= 1;
          } else if (this.tileIsTouched(tileSize, x, y, row + 1, col - 1, distance)) {
            row += 1;
            col -= 1;
          } else {
            throw new Error("How the hell did that happen?");
          }
        }
      }
    }
  }

  // closestShorelineTo(x: number, y: number): Coords {
  //   // this.each
  // }
}
