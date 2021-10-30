import Grid from "@/mapmaking/base/Grid";
import elevationNoise from "@/mapmaking/mudworld/generators/elevationNoise";
import moistureNoise from "@/mapmaking/mudworld/generators/moistureNoise";
import PathFinder, { PathNode } from "@/pathfinding/base/PathFinder";
import { coords, Coords } from "@/utilities/geo";

// const TILE_WIDTH = 16;

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
      const dryness = Math.floor(255 * (Math.max(elevation - 191, 0) / 64));
      // jesus christ
      const wetness = 0.8 * 255 * ((128 - Math.abs(elevation - 128)) / 128);

      const moisture = Math.max(wetness, this.noiseToByte(moistureNoise(x, y)) - dryness);

      // TODO: Structures will come later
      const structure = 0;

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
    return Math.floor((noiseModifier + 1) * 128);
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

  static structureFromTileValue(tileValue: number): number {
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
    return Math.floor(x / this.tileSize);
  }

  yToRow(y: number): number {
    return Math.floor(y / this.tileSize);
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

  randomCoordsOnLand(): Coords {
    const { width, height } = this;
    let x = 0;
    let y = 0;
    let elevation = -1;

    while (elevation < 129) {
      x = Math.floor(Math.random() * width);
      y = Math.floor(Math.random() * height);
      elevation = MudworldMap.elevationFromTileValue(this.valueAt(x, y));
    }

    return coords(x, y);
  }

  // NOTE: This returns TILE coords, not world coords.
  randomTileCoordsOnLand(): Coords {
    const worldCoords = this.randomCoordsOnLand();
    worldCoords[0] = Math.floor(worldCoords[0] / this.tileSize);
    worldCoords[1] = Math.floor(worldCoords[1] / this.tileSize);
    return worldCoords;
  }

  // NOTE: populates in reverse (end of list is start, beginning of list is dest)
  populatePath(path: PathNode[], startX: number, startY: number, destX: number, destY: number, eyesight: number): void {
    this.pathFinder.populatePath(path, startX, startY, destX, destY, eyesight, this.tileSize);
  }

  valueAt(x: number, y: number): number {
    return this.grid.valueAt(this.yToRow(y), this.xToCol(x));
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
}
