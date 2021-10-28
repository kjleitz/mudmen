import SimplexNoise from "simplex-noise";

// TODO: Seeds should probably be configurable, or from a browser fingerprint,
// or cached in localStorage (latter two for repeatability, former for new maps)
const continentSimplex = new SimplexNoise("continents");
const landSimplex = new SimplexNoise("land");
const localSimplex = new SimplexNoise("local");

export function continentElevationNoise(x: number, y: number): number {
  return continentSimplex.noise2D(x, y);
}

export function landElevationNoise(x: number, y: number): number {
  return landSimplex.noise2D(x, y);
}

export function localElevationNoise(x: number, y: number): number {
  return localSimplex.noise2D(x, y);
}

// export default function elevationNoise(x: number, y: number): number {
//   return (
//     (0.75 * continentElevationNoise(1.75 * x, 1.75 * y))
//     + (0.75 * landElevationNoise(5 * x, 5 * y))
//     + (0.25 * localElevationNoise(16 * x, 16 * y))
//   ) / 1.75;
// }

// const CONTINENT_WEIGHT = 0.75;
// const LAND_WEIGHT = 0.75;
// const LOCAL_WEIGHT = 0.25;
// const TOTAL_WEIGHT = CONTINENT_WEIGHT + LAND_WEIGHT + LOCAL_WEIGHT;

// export default function elevationNoise(x: number, y: number): number {
//   return (
//     (CONTINENT_WEIGHT * continentElevationNoise(1.75 * x, 1.75 * y))
//     + (LAND_WEIGHT * landElevationNoise(5 * x, 5 * y))
//     + (LOCAL_WEIGHT * localElevationNoise(16 * x, 16 * y))
//   ) / TOTAL_WEIGHT;
// }

const CONTINENT_WEIGHT = 1;
const LAND_WEIGHT = 0.75;
const LOCAL_WEIGHT = 0.25;
const ROCKY_WEIGHT = 0.25;
const TOTAL_WEIGHT = CONTINENT_WEIGHT + LAND_WEIGHT + LOCAL_WEIGHT + ROCKY_WEIGHT;

export default function elevationNoise(x: number, y: number): number {
  return (
    (CONTINENT_WEIGHT * continentElevationNoise(1.75 * x, 1.75 * y))
    + (LAND_WEIGHT * landElevationNoise(5 * x, 5 * y))
    + (LOCAL_WEIGHT * localElevationNoise(16 * x, 16 * y))
    + (ROCKY_WEIGHT * localElevationNoise(32 * x, 32 * y))
  ) / TOTAL_WEIGHT;
}
