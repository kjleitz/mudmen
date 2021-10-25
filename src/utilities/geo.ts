// NOTE: Coordinate system is locked to -32768...+32767 for x and y dimensions
// TODO: Reconsider this

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
