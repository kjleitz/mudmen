// Takes a value between 0 and 1, and returns a value between 0 and 1, weighted
// towards 1. Inputs close to 0 will output low, but mid- to upper-range values
// will tend to 1. Power should be a number between 0 and 1 as well; low values
// of `power` will result in a more even distribution, whereas higher values of
// `power` will result in output that tends more heavily to 1.
export function weightHigh(percent: number, power = 0.5): number {
  const exponent = 1 - power;
  return percent ** (exponent);
}

// Takes a value between 0 and 1, and returns a value between 0 and 1, weighted
// towards 0. Inputs close to 1 will output high, but mid- to low-range values
// will tend to 0. Power should be a number between 0 and 1 as well; low values
// of `power` will result in a more even distribution, whereas higher values of
// `power` will result in output that tends more heavily to 0.
export function weightLow(percent: number, power = 0.5): number {
  return 1 - weightHigh(1 - percent, power);
}

// Takes a value between 0 and 1, and returns a value between 0 and 1, weighted
// towards 0.5 (center). Power should be a number between 0 and 1 as well; low
// values of `power` will result in a more even distribution, whereas higher
// values of `power` will result in output that tends more heavily to 0.5.
export function weightMid(percent: number, power = 0.5): number {
  const percentFromCenter = 2 * Math.abs(percent - 0.5);
  const weightedValue = weightLow(percentFromCenter, power) / 2;
  return percent < 0.5 ? 0.5 - weightedValue : 0.5 + weightedValue;
}

// Takes a value between 0 and 1, and returns a value between 0 and 1, weighted
// towards 0 or 1 (the extremes). Inputs above 0.5 will tend more toward 1, and
// inputs below 0.5 will tend more toward zero. Power should be a number between
// 0 and 1 as well; low values of `power` will result in a more even
// distribution, whereas higher values of `power` will result in output that
// tends more heavily to 0 or 1.
export function weightExtreme(percent: number, power = 0.5): number {
  const distanceFromCenter = 2 * Math.abs(percent - 0.5);
  const weightedValue = weightHigh(distanceFromCenter, power) / 2;
  return percent < 0.5 ? 0.5 - weightedValue : 0.5 + weightedValue;
}
