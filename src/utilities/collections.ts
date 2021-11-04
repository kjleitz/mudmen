import { f, rand } from "@/utilities/math";

export function shuffleInPlace<T>(list: T[]): T[] {
  for (let i = 0; i < list.length; i++) {
    const j = i + f(rand() * (list.length - i));
    const item = list[i];
    list[i] = list[j];
    list[j] = item;
  }

  return list;
}

export function shuffle<T>(list: T[]): T[] {
  return shuffleInPlace([...list]);
}

export function reverseFind<T>(list: T[], mapper: (item: T, index: number) => boolean): T | undefined {
  for (let i = list.length - 1; i >= 0; i--) {
    if (mapper(list[i], i)) return list[i];
  }
}
