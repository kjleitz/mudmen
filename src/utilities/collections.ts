export function shuffleInPlace<T>(list: T[]): T[] {
  for (let i = 0; i < list.length; i++) {
    const j = i + Math.floor(Math.random() * (list.length - i))
    const item = list[i];
    list[i] = list[j];
    list[j] = item;
  }

  return list;
}

export function shuffle<T>(list: T[]): T[] {
  return shuffleInPlace([...list]);
}
