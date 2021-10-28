import SimplexNoise from "simplex-noise";

// TODO: Seeds should probably be configurable, or from a browser fingerprint,
// or cached in localStorage (latter two for repeatability, former for new maps)
const moistureSimplex = new SimplexNoise("moisture");

export default function moistureNoise(x: number, y: number): number {
  return moistureSimplex.noise2D(x, y);
}
