// NOTE: Coordinate system is locked to -32768...+32767 for x and y dimensions
// TODO: Reconsider this

import { f, rand, randBetween } from "@/utilities/math";

export type Coords = Int16Array;
export interface Position {
  x: number;
  y: number;
}

export function coords(x: number, y: number): Coords {
  const coords = new Int16Array(2);
  coords[0] = x;
  coords[1] = y;
  return coords;
}

export function distanceBetween(originX: number, originY: number, targetX: number, targetY: number): number {
  const dx = targetX - originX;
  const dy = targetY - originY;
  return Math.sqrt((dx ** 2) + (dy ** 2));
}

export function vectorBetween(originX: number, originY: number, targetX: number, targetY: number): Coords {
  return coords(targetX - originX, targetY - originY);
}

export function closestPositioned<T extends Position>(x: number, y: number, list: T[]): T | undefined {
  if (list.length === 0) return;

  let closestItem = list[0];
  if (list.length === 1) return closestItem;

  let closestDistance = distanceBetween(x, y, closestItem.x, closestItem.y);

  for (let i = 1; i < list.length; i++) {
    const item = list[i];
    const distance = distanceBetween(x, y, item.x, item.y);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestItem = item;
    }
  }

  return closestItem;
}

export function insideRect(
  x: number,
  y: number,
  originX: number,
  originY: number,
  height: number,
  width: number,
): boolean {
  return originX <= x
    && x <= (originX + width)
    && originY <= y
    && y <= (originY + height);
}

export function randomPointInCircle(x: number, y: number, radius: number): Coords;
export function randomPointInCircle(x: number, y: number, minRadius: number, maxRadius: number): Coords;
export function randomPointInCircle(x: number, y: number, minRadius: number, maxRadius?: number): Coords {
  if (!maxRadius) {
    maxRadius = minRadius;
    minRadius = 0;
  }

  // Basic "Random point in a circle" adapted from this great SO answer:
  // https://stackoverflow.com/a/50746409/7469691
  //
  // "Random point between two concentric circles" adapted from... my throbbing
  // head. Holy shit, this took a while to figure out.
  //
  const randAngle = rand() * (2 * Math.PI);
  const minRadiusPercent = minRadius / maxRadius;
  const randRadius = maxRadius * Math.sqrt(randBetween(minRadiusPercent ** 2, 1));

  return coords(
    f(x + (randRadius * Math.cos(randAngle))),
    f(y + (randRadius * Math.sin(randAngle))),
  );
}
