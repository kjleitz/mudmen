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

(window as any).frequency = 1;

export default function elevationNoise(x: number, y: number): number {
  // return (
  //   (1 * continentElevationNoise(x, y))
  //   + (0.5 * landElevationNoise(2 * x, 2 * y))
  //   + (0.25 * localElevationNoise(4 * x, 4 * y))
  // ) / 1.75;
  // return (
  //   ((window as any).controls.continents.magnitude.val * continentElevationNoise((window as any).controls.continents.frequency.val * x, (window as any).controls.continents.frequency.val * y))
  //   + ((window as any).controls.land.magnitude.val * landElevationNoise((window as any).controls.land.frequency.val * x, (window as any).controls.land.frequency.val * y))
  //   + ((window as any).controls.local.magnitude.val * localElevationNoise((window as any).controls.local.frequency.val * x, (window as any).controls.local.frequency.val * y))
  // ) / (
  //   (window as any).controls.continents.magnitude.val
  //   + (window as any).controls.land.magnitude.val
  //   + (window as any).controls.local.magnitude.val
  // );
  return (
    (0.75 * continentElevationNoise(1.75 * x, 1.75 * y))
    + (0.75 * landElevationNoise(5 * x, 5 * y))
    + (0.25 * localElevationNoise(16 * x, 16 * y))
  ) / 1.75;
}
