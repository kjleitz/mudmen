import Grid from "@/mapmaking/base/Grid";
import elevationNoise from "@/mapmaking/mudworld/noise/elevationNoise";
import moistureNoise from "@/mapmaking/mudworld/noise/moistureNoise";

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
  ): R
}

export default class MudworldMap {
  public grid: Grid<Uint32Array>;

  constructor(rowCount: number, colCount: number) {
    this.grid = new Grid(rowCount, colCount, Uint32Array);
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
    })
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
    })
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

  get rowCount(): number { return this.grid.rowCount }
  get colCount(): number { return this.grid.colCount }

  fillWithTerrain(): void {
    MudworldMap.fillWithTerrain(this.grid);
  }

  eachTile(mapper: MudworldMapper<void>): void {
    MudworldMap.eachTile(this.grid, mapper);
  }
}
