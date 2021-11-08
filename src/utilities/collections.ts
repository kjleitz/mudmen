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

export function mappedSetFor<Key, Value>(map: Map<Key, Set<Value>>, key: Key): Set<Value> {
  let values = map.get(key);

  if (!values) {
    values = new Set();
    map.set(key, values);
  }

  return values;
}

export function addToMappedSetFor<Key, Value>(map: Map<Key, Set<Value>>, key: Key, value: Value): void {
  mappedSetFor(map, key).add(value);
}

export function mappedArrayFor<Key, Value>(map: Map<Key, Value[]>, key: Key): Value[] {
  let values = map.get(key);

  if (!values) {
    values = [];
    map.set(key, values);
  }

  return values;
}

export function addToMappedArrayFor<Key, Value>(map: Map<Key, Value[]>, key: Key, value: Value): void {
  mappedArrayFor(map, key).push(value);
}
