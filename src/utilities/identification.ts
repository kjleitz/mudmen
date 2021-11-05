let lastId = 0;

export function globalSequentialId(): number {
  lastId += 1;
  return lastId;
}
