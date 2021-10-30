import MudworldMap from "@/mapmaking/mudworld/MudworldMap";

// TODO: This should be used to render _on top of_ existing tiles from the
//       rendered world, just into the viewport during the normal game loop, and
//       only at larger tile sizes. Like, should keep existing background colors
//       and just draw on top of them.
//
// TODO: Related to the above TODO, but also this is intended to be used for
//       more than just "shoreline" on the water... it should be an applicable
//       description of any tile that's lower in elevation than its neighbors
//       and needs to describe the "ledges" around itself.

export const enum Shoreline {
  NONE = 0b00000000,
  TOP_LEFT = 0b10000000,
  TOP = 0b01000000,
  TOP_RIGHT = 0b00100000,
  RIGHT = 0b00010000,
  BOTTOM_RIGHT = 0b00001000,
  BOTTOM = 0b00000100,
  BOTTOM_LEFT = 0b00000010,
  LEFT = 0b00000001,
}

export function shorelineHasLand(value: number, shoreline: Shoreline): boolean {
  return shoreline === Shoreline.NONE
    ? value === Shoreline.NONE
    : (value & shoreline) === shoreline;
}

export function shorelineAt(x: number, y: number, map: MudworldMap, tileSize: number): number {
  // x = Math.floor(x);
  // y = Math.floor(y);

  let shoreline = Shoreline.NONE;
  let ny: number;
  let nx: number;
  // const leftEdge = x === 0;
  // const topEdge = y === 0;

  // === TOP ROW ===
  ny = y - tileSize;

  // top left
  nx = x - tileSize;
  if (!map.underwaterAt(nx, ny)) shoreline |= Shoreline.TOP_LEFT;

  // top
  nx = x;
  if (!map.underwaterAt(nx, ny)) shoreline |= Shoreline.TOP;

  // top right
  nx = x + tileSize;
  if (!map.underwaterAt(nx, ny)) shoreline |= Shoreline.TOP_RIGHT;

  // === LEFT AND RIGHT SIDES ===
  ny = y;

  // left
  nx = x - tileSize;
  if (!map.underwaterAt(nx, ny)) shoreline |= Shoreline.LEFT;

  // right
  nx = x + tileSize;
  if (!map.underwaterAt(nx, ny)) shoreline |= Shoreline.RIGHT;

  // === BOTTOM ROW ===
  ny = y + tileSize;

  // bottom left
  nx = x - tileSize;
  if (!map.underwaterAt(nx, ny)) shoreline |= Shoreline.BOTTOM_LEFT;

  // bottom
  nx = x;
  if (!map.underwaterAt(nx, ny)) shoreline |= Shoreline.BOTTOM;

  // bottom right
  nx = x + tileSize;
  if (!map.underwaterAt(nx, ny)) shoreline |= Shoreline.BOTTOM_RIGHT;

  return shoreline;
}
