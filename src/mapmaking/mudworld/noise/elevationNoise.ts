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

export default function elevationNoise(x: number, y: number): number {
  return (
    (0.75 * continentElevationNoise(1.75 * x, 1.75 * y))
    + (0.75 * landElevationNoise(5 * x, 5 * y))
    + (0.25 * localElevationNoise(16 * x, 16 * y))
  ) / 1.75;
}
