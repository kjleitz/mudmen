export const f = Math.floor;
export const c = Math.ceil;
export const rand = Math.random;

export function randBetween(min: number, max: number) {
  return min + (rand() * (max - min));
}
